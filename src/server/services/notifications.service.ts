import { createClient } from '@/lib/supabase/server'
import { insertNotification } from '@/server/repositories/notifications.repository'
import type { NotificationType } from '@/types/notifications'

interface CreateNotificationInput {
  body: string
  eventId?: string | null
  link?: string | null
  title: string
  type: NotificationType
  userId: string
}

export async function createNotification(input: CreateNotificationInput) {
  const supabase = await createClient()

  return insertNotification(supabase, {
    user_id: input.userId,
    event_id: input.eventId ?? null,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link ?? null,
  })
}
