// types/assignments.ts

import type { FileType } from '@/types/file'

export type AssignmentStatus = 'not_submitted' | 'submitted' | 'graded'
export type AssignmentRole = 'teacher' | 'student'

export interface AssignmentSubmission {
  id: string
  student_id: string
  student_name: string
  content?: string | null
  simulator_module?: string | null
  screenshot_path?: string | null
  screenshot_url?: string | null
  submitted_at: string
  score?: number | null
  feedback?: string | null
  graded_at?: string | null
  graded_by?: string | null
  files?: SubmissionAttachment[]
}

export interface AssignmentAttachment {
  id: string
  name: string
  type: FileType
  mimeType: string
  extension: string
  url: string
  size?: number | null
  uploadedBy: string
  uploadedAt: string
}

export interface SubmissionAttachment extends AssignmentAttachment {
  submission_id?: string
}

export interface Assignment {
  id: string
  class_id: string
  title: string
  description: string | null
  points: number | null
  status: AssignmentStatus
  due_date: string | null
  created_at: string
  simulator_module?: string | null
  my_role?: AssignmentRole | null
  score?: number | null
  feedback?: string | null
  graded_at?: string | null
  submissions?: AssignmentSubmission[]
  own_submission?: AssignmentSubmission | null
  files?: AssignmentAttachment[]
}

export interface AssignmentPage {
  id: string
  class_id: string
  title: string
  description: string
  due_date: string
  created_at: string
  points?: number | null
  status?: AssignmentStatus
}

export interface Comment {
  id: string
  assignment_id: string
  user_id: string
  user_name?: string
  content: string
  created_at: string
}

export interface AssignmentWithComments extends Assignment {
  comments?: Comment[]
  comment_count?: number
}
