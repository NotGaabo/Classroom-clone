import { createClient } from '@/lib/supabase/server'
import { createSupabaseUnavailableError, isSupabaseNetworkError } from '@/lib/supabase/errors'
import { ensureProfileForUser, findProfileById } from '@/server/repositories/profiles.repository'
import { buildCapabilities } from '@/server/permissions/capabilities'
import type { AuthContext } from '@/types/platform'

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient()

  const authResult = await supabase.auth.getUser()
  const user = authResult.data.user
  const error = authResult.error

  if (isSupabaseNetworkError(error)) {
    throw createSupabaseUnavailableError('No se pudo verificar la sesión con Supabase.')
  }

  if (error || !user) {
    return null
  }

  let profile: Awaited<ReturnType<typeof findProfileById>>

  try {
    profile = await findProfileById(supabase, user.id)
  } catch (profileError) {
    if (isSupabaseNetworkError(profileError)) {
      throw createSupabaseUnavailableError('No se pudo cargar el perfil desde Supabase.')
    }

    throw profileError
  }

  if (!profile) {
    try {
      profile = await ensureProfileForUser(supabase, user)
    } catch (profileError) {
      if (isSupabaseNetworkError(profileError)) {
        throw createSupabaseUnavailableError('No se pudo crear o cargar el perfil desde Supabase.')
      }

      throw profileError
    }
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
