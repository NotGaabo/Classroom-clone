import type { ActivityEventRecord } from '@/types/events'

export interface RealtimeEnvelope<T = Record<string, unknown>> {
  event: ActivityEventRecord['event_type']
  eventId: string
  payload: T
  version: number
}
