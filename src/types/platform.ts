import type { User } from '@supabase/supabase-js'

export type AppRole = 'admin' | 'teacher' | 'student'

export type EnrollmentState = 'pending' | 'active' | 'removed' | 'invited' | 'rejected'

export type SubmissionState =
  | 'draft'
  | 'submitted'
  | 'returned'
  | 'late'
  | 'graded'
  | 'resubmitted'

export interface CapabilitySet {
  canArchiveClass: boolean
  canComment: boolean
  canCreateClass: boolean
  canDeleteAssignment: boolean
  canDeleteClass: boolean
  canEditAssignment: boolean
  canEditClass: boolean
  canGrade: boolean
  canJoinClass: boolean
  canManagePeople: boolean
  canManageSystem: boolean
  canPublishAssignment: boolean
  canResubmitWork: boolean
  canSubmitWork: boolean
  canViewGrades: boolean
}

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: AppRole
  is_active: boolean
}

export interface MembershipRecord {
  class_id: string
  user_id: string
  role: AppRole
  enrollment_state: EnrollmentState
  joined_at?: string | null
  invited_at?: string | null
  removed_at?: string | null
  rejected_at?: string | null
}

export interface AuthContext {
  user: User
  profile: UserProfile
  capabilities: CapabilitySet
}

export interface ClassAccessContext {
  classId: string
  isOwner: boolean
  membership: MembershipRecord | null
  role: AppRole
  capabilities: CapabilitySet
}
