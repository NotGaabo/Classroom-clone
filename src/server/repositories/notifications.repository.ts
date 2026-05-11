import { createClient } from '@/lib/supabase/server'
import type { NotificationType } from '@/types/notifications'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

interface InsertNotificationInput {
  body: string
  event_id?: string | null
  link?: string | null
  title: string
  type: NotificationType
  user_id: string
}

export async function insertNotification(
  supabase: SupabaseServerClient,
  input: InsertNotificationInput
) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.user_id,
      event_id: input.event_id ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    })
    .select()
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ?? null
}
