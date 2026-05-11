import { createClient } from '@/lib/supabase/server'
import { ensureProfileForUser, findProfileById } from '@/server/repositories/profiles.repository'
import { buildCapabilities } from '@/server/permissions/capabilities'
import type { AuthContext } from '@/types/platform'

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  let profile = await findProfileById(supabase, user.id)

  if (!profile) {
    profile = await ensureProfileForUser(supabase, user)
  }

  if (!profile || !profile.is_active) {
    return null
  }

  return {
    user,
    profile,
    capabilities: buildCapabilities({ role: profile.role }),
  }
}

export async function requireAuth() {
  const context = await getAuthContext()

  if (!context) {
    const error = new Error('Not authenticated')
    error.name = 'AUTH_REQUIRED'
    throw error
  }

  return context
}
