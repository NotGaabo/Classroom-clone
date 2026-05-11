export type NotificationType =
  | 'announcement_posted'
  | 'assignment_created'
  | 'assignment_graded'
  | 'class_invitation'
  | 'class_join_request'
  | 'comment_added'
  | 'system_updates'

export interface NotificationPreferences {
  assignment_created: boolean
  assignment_graded: boolean
  channel_email: boolean
  channel_in_app: boolean
  class_invitation: boolean
  class_join_request: boolean
  announcement_posted: boolean
  comment_added: boolean
  system_updates: boolean
  user_id: string
}
