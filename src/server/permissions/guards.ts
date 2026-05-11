import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/server/auth/auth.service'
import { findClassById } from '@/server/repositories/classes.repository'
import { findMembershipForUser } from '@/server/repositories/memberships.repository'
import { buildCapabilities } from '@/server/permissions/capabilities'
import type { AppRole, ClassAccessContext, EnrollmentState } from '@/types/platform'

export async function requireRole(...roles: AppRole[]) {
  const context = await requireAuth()

  if (!roles.includes(context.profile.role)) {
    const error = new Error('Forbidden')
    error.name = 'ROLE_REQUIRED'
    throw error
  }

  return context
}

export async function requireClassMembership(
  classId: string,
  states: EnrollmentState[] = ['active']
): Promise<ClassAccessContext> {
  const context = await requireAuth()
  const supabase = await createClient()
  const membership = await findMembershipForUser(supabase, classId, context.user.id)

  if (!membership || !states.includes(membership.enrollment_state)) {
    const error = new Error('Class membership required')
    error.name = 'CLASS_MEMBERSHIP_REQUIRED'
    throw error
  }

  const classRow = await findClassById(supabase, classId)
  const isOwner = classRow?.teacher_id === context.user.id

  return {
    classId,
    isOwner,
    membership,
    role: context.profile.role,
    capabilities: buildCapabilities({
      role: context.profile.role,
      isClassOwner: isOwner,
      enrollmentState: membership.enrollment_state,
    }),
  }
}

export async function requireClassOwnershipOrAdmin(classId: string) {
  const membershipContext = await requireClassMembership(classId)

  if (membershipContext.role === 'admin' || membershipContext.isOwner) {
    return membershipContext
  }

  const error = new Error('Class owner or admin required')
  error.name = 'CLASS_OWNER_REQUIRED'
  throw error
}
