// types/assignments.ts

export interface Assignment {
  id: string
  class_id: string
  title: string
  description: string | null
  due_date: string | null
  created_at: string
}

export interface AssignmentPage {
  id: string
  class_id: string
  title: string
  description: string
  due_date: string
  created_at: string
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