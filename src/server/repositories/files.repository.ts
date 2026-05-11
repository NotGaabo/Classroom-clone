import { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export async function findFilesByOwner(supabase: SupabaseServerClient, ownerId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('owner_id', ownerId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}
