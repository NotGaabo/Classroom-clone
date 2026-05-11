import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { AppRole, UserProfile } from '@/types/platform'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

interface RawProfileRow {
  avatar_url: string | null
  email: string | null
  full_name: string | null
  id: string
  is_active: boolean | null
  role: AppRole
}

function mapProfile(row: RawProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    role: row.role,
    is_active: row.is_active ?? true,
  }
}

export async function findProfileById(supabase: SupabaseServerClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProfile(data as RawProfileRow) : null
}

export async function ensureProfileForUser(supabase: SupabaseServerClient, user: User) {
  const existingProfile = await findProfileById(supabase, user.id)

  if (existingProfile) {
    return existingProfile
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name:
          typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name
            : null,
        avatar_url:
          typeof user.user_metadata?.avatar_url === 'string'
            ? user.user_metadata.avatar_url
            : null,
        role: 'student' satisfies AppRole,
        is_active: true,
      },
      {
        onConflict: 'id',
      }
    )
    .select('id, email, full_name, avatar_url, role, is_active')
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return mapProfile(data as RawProfileRow)
  }

  return findProfileById(supabase, user.id)
}
