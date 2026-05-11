import { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function findSubmissionById(supabase: SupabaseServerClient, submissionId: string) {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('id', submissionId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ?? null
}
