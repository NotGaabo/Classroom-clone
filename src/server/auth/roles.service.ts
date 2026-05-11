import { createClient } from '@/lib/supabase/server'
import { findProfileById } from '@/server/repositories/profiles.repository'
import { insertAuditLog } from '@/server/repositories/audit.repository'
import { insertActivityEvent } from '@/server/repositories/events.repository'
import type { AppRole } from '@/types/platform'

export async function updateUserRole(input: {
  actorId: string
  targetUserId: string
  nextRole: AppRole
}) {
  const supabase = await createClient()
  const existingProfile = await findProfileById(supabase, input.targetUserId)

  if (!existingProfile) {
    throw new Error('Target profile not found')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: input.nextRole })
    .eq('id', input.targetUserId)

  if (error) {
    throw error
  }

  await insertActivityEvent(supabase, {
    actor_id: input.actorId,
    event_type: 'ROLE_CHANGED',
    metadata: {
      previousRole: existingProfile.role,
      schemaVersion: 1,
      source: 'roles.service',
    },
    payload: {
      nextRole: input.nextRole,
      previousRole: existingProfile.role,
      targetUserId: input.targetUserId,
    },
    target_entity: 'profile',
    target_entity_id: input.targetUserId,
  })

  await insertAuditLog(supabase, {
    actor_id: input.actorId,
    action: 'role_changed',
    entity: 'profile',
    entity_id: input.targetUserId,
    metadata: {
      nextRole: input.nextRole,
      previousRole: existingProfile.role,
    },
  })
}
