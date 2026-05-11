import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/server/auth/auth.service'
import { findClassById } from '@/server/repositories/classes.repository'
import {
  createAssignmentRecord,
  findAssignmentById,
  listAssignmentsForClass,
  listGradesForSubmissionIds,
  listStudentSubmissionsForAssignments,
  type AssignmentSummaryRow,
} from '@/server/repositories/assignments.repository'
import { insertAuditLog } from '@/server/repositories/audit.repository'
import { requireClassMembership } from '@/server/permissions/guards'
import { publishDomainEvent } from '@/server/services/events.service'
import type { Assignment, AssignmentRole, AssignmentStatus } from '@/types/assignments'

function resolveAssignmentStatus(score: number | null, isSubmitted: boolean): AssignmentStatus {
  if (score !== null) {
    return 'graded'
  }

  return isSubmitted ? 'submitted' : 'not_submitted'
}

function toAssignmentRole(role: string): AssignmentRole {
  return role === 'student' ? 'student' : 'teacher'
}

function mapAssignmentRow(
  row: AssignmentSummaryRow,
  role: AssignmentRole,
  score: number | null,
  isSubmitted: boolean
): Assignment {
  return {
    ...row,
    my_role: role,
    score,
    status: resolveAssignmentStatus(score, isSubmitted),
  }
}

export async function listManagedAssignments(classId: string) {
  const auth = await requireAuth()
  const access = await requireClassMembership(classId)
  const supabase = await createClient()
  const membership = access.membership

  if (!membership) {
    const error = new Error('Class membership required')
    error.name = 'CLASS_MEMBERSHIP_REQUIRED'
    throw error
  }

  const assignments = await listAssignmentsForClass(supabase, classId)
  const membershipRole = toAssignmentRole(membership.role)

  if (assignments.length === 0) {
    return [] as Assignment[]
  }

  if (membershipRole !== 'student') {
    return assignments.map((assignment) => mapAssignmentRow(assignment, membershipRole, null, false))
  }

  const assignmentIds = assignments.map((assignment) => assignment.id)
  const submissions = await listStudentSubmissionsForAssignments(supabase, assignmentIds, auth.user.id)
  const submittedSet = new Set(submissions.map((submission) => submission.assignment_id))
  const gradesMap = new Map<string, number | null>()

  if (submissions.length > 0) {
    const grades = await listGradesForSubmissionIds(
      supabase,
      submissions.map((submission) => submission.id)
    )

    grades.forEach((grade) => {
      gradesMap.set(grade.assignment_id, grade.score)
    })
  }

  return assignments.map((assignment) =>
    mapAssignmentRow(
      assignment,
      membershipRole,
      gradesMap.get(assignment.id) ?? null,
      submittedSet.has(assignment.id)
    )
  )
}

export async function getManagedAssignmentAccess(assignmentId: string) {
  const supabase = await createClient()
  const assignment = await findAssignmentById(supabase, assignmentId)

  if (!assignment) {
    const error = new Error('Assignment not found')
    error.name = 'NOT_FOUND'
    throw error
  }

  const access = await requireClassMembership(assignment.class_id)

  return {
    access,
    assignment,
  }
}

export async function createManagedAssignment(input: {
  class_id: string
  description?: string | null
  due_date?: string | null
  points?: number | null
  title: string
}) {
  const auth = await requireAuth()
  const supabase = await createClient()
  const classroom = await findClassById(supabase, input.class_id)

  if (!classroom) {
    const error = new Error('Class not found')
    error.name = 'NOT_FOUND'
    throw error
  }

  const isAdmin = auth.profile.role === 'admin'
  const isOwner = classroom.teacher_id === auth.user.id

  if (!isAdmin && !isOwner) {
    const error = new Error('Only class owners or admins can create assignments')
    error.name = 'FORBIDDEN'
    throw error
  }

  const normalizedTitle = input.title.trim()
  if (!normalizedTitle) {
    const error = new Error('Assignment title is required')
    error.name = 'VALIDATION_ERROR'
    throw error
  }

  if (input.due_date) {
    const parsedDueDate = new Date(input.due_date)

    if (Number.isNaN(parsedDueDate.getTime())) {
      const error = new Error('Assignment due date is invalid')
      error.name = 'VALIDATION_ERROR'
      throw error
    }
  }

  if (input.points !== null && input.points !== undefined && input.points < 0) {
    const error = new Error('Assignment points must be zero or positive')
    error.name = 'VALIDATION_ERROR'
    throw error
  }

  const assignment = await createAssignmentRecord(supabase, {
    class_id: input.class_id,
    title: normalizedTitle,
    description: input.description?.trim() || null,
    due_date: input.due_date ?? null,
    points: input.points ?? null,
  })

  const event = await publishDomainEvent({
    actorId: auth.user.id,
    assignmentId: assignment.id,
    classId: assignment.class_id,
    eventType: 'ASSIGNMENT_CREATED',
    payload: {
      title: assignment.title,
      due_date: assignment.due_date,
      points: assignment.points,
    },
    targetEntity: 'assignment',
    targetEntityId: assignment.id,
  })

  await insertAuditLog(supabase, {
    actor_id: auth.user.id,
    action: 'assignment_created',
    entity: 'assignment',
    entity_id: assignment.id,
    metadata: {
      classId: assignment.class_id,
      eventId: event?.id ?? null,
    },
  })

  return mapAssignmentRow(assignment, isAdmin ? 'teacher' : 'teacher', null, false)
}
