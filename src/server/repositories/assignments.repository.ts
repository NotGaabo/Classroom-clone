import { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export interface AssignmentSummaryRow {
  class_id: string
  created_at: string
  description: string | null
  due_date: string | null
  id: string
  points: number | null
  simulator_module?: string | null
  title: string
}

export interface SubmissionLookupRow {
  assignment_id: string
  id: string
}

export interface GradeLookupRow {
  assignment_id: string
  score: number | null
  submission_id: string
}

export async function listAssignmentsForClass(supabase: SupabaseServerClient, classId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('id, class_id, title, description, points, due_date, created_at, simulator_module')
    .eq('class_id', classId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data as AssignmentSummaryRow[] | null) ?? []
}

export async function createAssignmentRecord(
  supabase: SupabaseServerClient,
  input: {
    class_id: string
    description?: string | null
    due_date?: string | null
    points?: number | null
    title: string
  }
) {
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      class_id: input.class_id,
      title: input.title,
      description: input.description ?? null,
      due_date: input.due_date ?? null,
      points: input.points ?? null,
    })
    .select('id, class_id, title, description, points, due_date, created_at, simulator_module')
    .single()

  if (error) {
    throw error
  }

  return data as AssignmentSummaryRow
}

export async function findAssignmentById(supabase: SupabaseServerClient, assignmentId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('id, class_id, title, description, points, due_date, created_at, simulator_module')
    .eq('id', assignmentId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data as AssignmentSummaryRow | null) ?? null
}

export async function listStudentSubmissionsForAssignments(
  supabase: SupabaseServerClient,
  assignmentIds: string[],
  studentId: string
) {
  if (assignmentIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('id, assignment_id')
    .eq('student_id', studentId)
    .in('assignment_id', assignmentIds)

  if (error) {
    throw error
  }

  return (data as SubmissionLookupRow[] | null) ?? []
}

export async function listGradesForSubmissionIds(
  supabase: SupabaseServerClient,
  submissionIds: string[]
) {
  if (submissionIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('assignment_submissions_grades')
    .select('submission_id, assignment_id, score')
    .in('submission_id', submissionIds)

  if (error) {
    throw error
  }

  return (data as GradeLookupRow[] | null) ?? []
}
