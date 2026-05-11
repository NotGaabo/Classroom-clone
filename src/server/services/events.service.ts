import { createClient } from '@/lib/supabase/server'
import { insertActivityEvent } from '@/server/repositories/events.repository'
import type { ActivityEventType } from '@/types/events'

interface PublishEventInput {
  actorId?: string | null
  assignmentId?: string | null
  classId?: string | null
  eventType: ActivityEventType
  metadata?: Record<string, unknown>
  payload?: Record<string, unknown>
  targetEntity: string
  targetEntityId: string
}

export async function publishDomainEvent(input: PublishEventInput) {
  const supabase = await createClient()

  return insertActivityEvent(supabase, {
    actor_id: input.actorId ?? null,
    assignment_id: input.assignmentId ?? null,
    class_id: input.classId ?? null,
    event_type: input.eventType,
    metadata: {
      schemaVersion: 1,
      source: 'services',
      ...input.metadata,
    },
    payload: input.payload ?? {},
    target_entity: input.targetEntity,
    target_entity_id: input.targetEntityId,
    version: 1,
  })
}
