import { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export interface AssignmentCommentRow {
  assignment_id: string
  content: string
  created_at: string
  id: string
  profiles?: {
    full_name?: string | null
  } | null
  user_id: string
}

export async function listAssignmentComments(supabase: SupabaseServerClient, assignmentId: string) {
  const { data, error } = await supabase
    .from('assignment_comments')
    .select(`
      id,
      assignment_id,
      user_id,
      content,
      created_at,
      profiles:user_id (
        full_name
      )
    `)
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return (data as AssignmentCommentRow[] | null) ?? []
}

export async function createAssignmentCommentRecord(
  supabase: SupabaseServerClient,
  input: {
    assignment_id: string
    content: string
    user_id: string
  }
) {
  const { data, error } = await supabase
    .from('assignment_comments')
    .insert({
      assignment_id: input.assignment_id,
      user_id: input.user_id,
      content: input.content,
    })
    .select(`
      id,
      assignment_id,
      user_id,
      content,
      created_at,
      profiles:user_id (
        full_name
      )
    `)
    .single()

  if (error) {
    throw error
  }

  return data as AssignmentCommentRow
}
