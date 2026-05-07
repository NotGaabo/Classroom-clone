import type { SupabaseClient, User } from '@supabase/supabase-js'

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
  fullName?: string
) {
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  if (existingProfile) {
    return
  }

  const displayName =
    fullName?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    user.email?.split('@')[0] ||
    'Usuario'

  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: displayName,
      email: user.email ?? null,
      role: user.user_metadata?.role ?? 'student',
    })

  if (insertError && insertError.code !== '23505') {
    throw insertError
  }
}
