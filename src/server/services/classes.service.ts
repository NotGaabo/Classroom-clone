import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/server/auth/auth.service'
import { deleteClassroom, findClassById, joinClassByCode, listClassesForUser, createClassroom } from '@/server/repositories/classes.repository'
import { insertAuditLog } from '@/server/repositories/audit.repository'
import { publishDomainEvent } from '@/server/services/events.service'
import { requireClassMembership, requireClassOwnershipOrAdmin } from '@/server/permissions/guards'

export async function listVisibleClasses() {
  const auth = await requireAuth()
  const supabase = await createClient()

  return listClassesForUser(supabase, auth.user.id)
}

export async function getClassDetail(classId: string) {
  await requireClassMembership(classId)
  const supabase = await createClient()

  return findClassById(supabase, classId)
}

export async function createManagedClass(input: { description?: string | null; name: string }) {
  const auth = await requireAuth()

  if (!auth.capabilities.canCreateClass) {
    const error = new Error('Only teachers or admins can create classes')
    error.name = 'FORBIDDEN'
    throw error
  }

  const supabase = await createClient()
  const createdClass = await createClassroom(supabase, {
    name: input.name.trim(),
    description: input.description?.trim() || null,
  })

  if (createdClass?.id) {
    const event = await publishDomainEvent({
      actorId: auth.user.id,
      classId: createdClass.id,
      eventType: 'CLASS_CREATED',
      payload: {
        name: createdClass.name,
      },
      targetEntity: 'class',
      targetEntityId: createdClass.id,
    })

    await insertAuditLog(supabase, {
      actor_id: auth.user.id,
      action: 'class_created',
      entity: 'class',
      entity_id: createdClass.id,
      metadata: {
        eventId: event?.id ?? null,
      },
    })
  }

  return createdClass
}

export async function joinManagedClass(code: string) {
  const auth = await requireAuth()

  if (!auth.capabilities.canJoinClass) {
    const error = new Error('Current role cannot join classes')
    error.name = 'FORBIDDEN'
    throw error
  }

  const supabase = await createClient()
  const result = await joinClassByCode(supabase, code)

  if (result && typeof result === 'object' && 'status' in result && result.status === 'joined') {
    const joinedClass = 'class' in result ? (result.class as { id?: string } | null) : null

    if (joinedClass?.id) {
      await publishDomainEvent({
        actorId: auth.user.id,
        classId: joinedClass.id,
        eventType: 'CLASS_JOINED',
        payload: {
          classId: joinedClass.id,
          userId: auth.user.id,
        },
        targetEntity: 'class_membership',
        targetEntityId: `${joinedClass.id}:${auth.user.id}`,
      })
    }
  }

  return result
}

export async function deleteManagedClass(classId: string) {
  const auth = await requireAuth()
  await requireClassOwnershipOrAdmin(classId)

  const supabase = await createClient()
  await deleteClassroom(supabase, classId)

  await insertAuditLog(supabase, {
    actor_id: auth.user.id,
    action: 'class_deleted',
    entity: 'class',
    entity_id: classId,
  })
}
