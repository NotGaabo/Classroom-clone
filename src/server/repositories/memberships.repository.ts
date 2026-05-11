import { createClient } from '@/lib/supabase/server'
import type { AppRole, EnrollmentState, MembershipRecord } from '@/types/platform'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

interface RawMembershipRow {
  class_id: string
  enrollment_state?: EnrollmentState | null
  invited_at?: string | null
  joined_at?: string | null
  rejected_at?: string | null
  removed_at?: string | null
  role: AppRole
  user_id: string
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  return error?.code === '42703'
}

function mapMembership(row: RawMembershipRow): MembershipRecord {
  return {
    class_id: row.class_id,
    user_id: row.user_id,
    role: row.role,
    enrollment_state: row.enrollment_state ?? 'active',
    joined_at: row.joined_at ?? null,
    invited_at: row.invited_at ?? null,
    removed_at: row.removed_at ?? null,
    rejected_at: row.rejected_at ?? null,
  }
}

export async function findMembershipForUser(
  supabase: SupabaseServerClient,
  classId: string,
  userId: string
) {
  const primaryQuery = await supabase
    .from('class_members')
    .select('class_id, user_id, role, enrollment_state, joined_at, invited_at, removed_at, rejected_at')
    .eq('class_id', classId)
    .eq('user_id', userId)
    .maybeSingle()

  if (primaryQuery.error && !isMissingColumnError(primaryQuery.error)) {
    throw primaryQuery.error
  }

  const legacyQuery = primaryQuery.error
    ? await supabase
        .from('class_members')
        .select('class_id, user_id, role')
        .eq('class_id', classId)
        .eq('user_id', userId)
        .maybeSingle()
    : null

  if (legacyQuery?.error) {
    throw legacyQuery.error
  }

  const row = primaryQuery.error ? legacyQuery?.data : primaryQuery.data

  return row ? mapMembership(row as RawMembershipRow) : null
}
