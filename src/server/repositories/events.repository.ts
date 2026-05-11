import { createClient } from '@/lib/supabase/server'
import type { ActivityEventType } from '@/types/events'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

interface InsertActivityEventInput {
  actor_id?: string | null
  assignment_id?: string | null
  class_id?: string | null
  event_type: ActivityEventType
  metadata?: Record<string, unknown>
  payload?: Record<string, unknown>
  target_entity: string
  target_entity_id: string
  version?: number
}

function isMissingEventsInfrastructureError(error: { code?: string; message?: string } | null) {
  return error?.code === 'PGRST205' || error?.code === '42P01'
}

export async function insertActivityEvent(
  supabase: SupabaseServerClient,
  input: InsertActivityEventInput
) {
  const { data, error } = await supabase
    .from('activity_events')
    .insert({
      version: input.version ?? 1,
      event_type: input.event_type,
      actor_id: input.actor_id ?? null,
      class_id: input.class_id ?? null,
      assignment_id: input.assignment_id ?? null,
      payload: input.payload ?? {},
      metadata: input.metadata ?? {},
      target_entity: input.target_entity,
      target_entity_id: input.target_entity_id,
    })
    .select()
    .maybeSingle()

  if (error) {
    if (isMissingEventsInfrastructureError(error)) {
      console.warn('Activity event skipped because activity_events is not available in the current schema:', error.message)
      return null
    }

    throw error
  }

  return data ?? null
}
