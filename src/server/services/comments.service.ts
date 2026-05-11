import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/server/auth/auth.service'
import { insertAuditLog } from '@/server/repositories/audit.repository'
import {
  createAssignmentCommentRecord,
  listAssignmentComments,
  type AssignmentCommentRow,
} from '@/server/repositories/comments.repository'
import { getManagedAssignmentAccess } from '@/server/services/assignments.service'
import { publishDomainEvent } from '@/server/services/events.service'
import type { Comment } from '@/types/assignments'

function mapComment(comment: AssignmentCommentRow): Comment {
  return {
    id: comment.id,
    assignment_id: comment.assignment_id,
    user_id: comment.user_id,
    user_name: comment.profiles?.full_name ?? 'Usuario',
    content: comment.content,
    created_at: comment.created_at,
  }
}

export async function listManagedAssignmentComments(assignmentId: string) {
  await getManagedAssignmentAccess(assignmentId)
  const supabase = await createClient()
  const comments = await listAssignmentComments(supabase, assignmentId)

  return comments.map(mapComment)
}

export async function createManagedAssignmentComment(assignmentId: string, content: string) {
  const auth = await requireAuth()
  const { assignment } = await getManagedAssignmentAccess(assignmentId)
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    const error = new Error('Comment content is required')
    error.name = 'VALIDATION_ERROR'
    throw error
  }

  const supabase = await createClient()
  const createdComment = await createAssignmentCommentRecord(supabase, {
    assignment_id: assignmentId,
    user_id: auth.user.id,
    content: normalizedContent,
  })

  const event = await publishDomainEvent({
    actorId: auth.user.id,
    assignmentId,
    classId: assignment.class_id,
    eventType: 'COMMENT_ADDED',
    payload: {
      contentPreview: normalizedContent.slice(0, 120),
    },
    targetEntity: 'assignment_comment',
    targetEntityId: createdComment.id,
  })

  await insertAuditLog(supabase, {
    actor_id: auth.user.id,
    action: 'assignment_comment_created',
    entity: 'assignment_comment',
    entity_id: createdComment.id,
    metadata: {
      assignmentId,
      classId: assignment.class_id,
      eventId: event?.id ?? null,
    },
  })

  return mapComment(createdComment)
}
