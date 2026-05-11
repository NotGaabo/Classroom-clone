export type ClassDetail = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type Class = ClassDetail & {
  teacher_name?: string | null
}
