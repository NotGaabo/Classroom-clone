export type ActivityEventType =
  | 'ASSIGNMENT_CREATED'
  | 'ASSIGNMENT_UPDATED'
  | 'CLASS_ARCHIVED'
  | 'CLASS_CREATED'
  | 'CLASS_JOINED'
  | 'CLASS_UPDATED'
  | 'COMMENT_ADDED'
  | 'NOTIFICATION_CREATED'
  | 'ROLE_CHANGED'
  | 'SUBMISSION_GRADED'
  | 'SUBMISSION_RETURNED'
  | 'SUBMISSION_SUBMITTED'

export interface ActivityEventRecord {
  id: string
  assignment_id: string | null
  actor_id: string | null
  class_id: string | null
  created_at: string
  event_type: ActivityEventType
  metadata: Record<string, unknown>
  payload: Record<string, unknown>
  target_entity: string
  target_entity_id: string
  version: number
}
