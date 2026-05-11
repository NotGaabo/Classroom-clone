import type { AppRole, CapabilitySet, EnrollmentState } from '@/types/platform'

const ALL_FALSE_CAPABILITIES: CapabilitySet = {
  canArchiveClass: false,
  canComment: false,
  canCreateClass: false,
  canDeleteAssignment: false,
  canDeleteClass: false,
  canEditAssignment: false,
  canEditClass: false,
  canGrade: false,
  canJoinClass: false,
  canManagePeople: false,
  canManageSystem: false,
  canPublishAssignment: false,
  canResubmitWork: false,
  canSubmitWork: false,
  canViewGrades: false,
}

interface CapabilityContext {
  enrollmentState?: EnrollmentState | null
  isClassOwner?: boolean
  isClassScoped?: boolean
  role: AppRole
}

export function buildCapabilities(context: CapabilityContext): CapabilitySet {
  const {
    role,
    isClassOwner = false,
    enrollmentState = 'active',
    isClassScoped = false,
  } = context
  const isActiveMember = enrollmentState === 'active'

  if (role === 'admin') {
    return {
      canArchiveClass: true,
      canComment: true,
      canCreateClass: true,
      canDeleteAssignment: true,
      canDeleteClass: true,
      canEditAssignment: true,
      canEditClass: true,
      canGrade: true,
      canJoinClass: true,
      canManagePeople: true,
      canManageSystem: true,
      canPublishAssignment: true,
      canResubmitWork: true,
      canSubmitWork: true,
      canViewGrades: true,
    }
  }

  if (!isClassScoped) {
    return {
      ...ALL_FALSE_CAPABILITIES,
      canCreateClass: true,
      canJoinClass: true,
    }
  }

  if (role === 'teacher') {
    return {
      ...ALL_FALSE_CAPABILITIES,
      canArchiveClass: isActiveMember && isClassOwner,
      canComment: isActiveMember,
      canDeleteAssignment: isActiveMember,
      canDeleteClass: isActiveMember && isClassOwner,
      canEditAssignment: isActiveMember,
      canEditClass: isActiveMember,
      canGrade: isActiveMember,
      canManagePeople: isActiveMember,
      canPublishAssignment: isActiveMember,
      canViewGrades: true,
    }
  }

  return {
    ...ALL_FALSE_CAPABILITIES,
    canComment: isActiveMember,
    canJoinClass: true,
    canResubmitWork: isActiveMember,
    canSubmitWork: isActiveMember,
    canViewGrades: isActiveMember,
  }
}
