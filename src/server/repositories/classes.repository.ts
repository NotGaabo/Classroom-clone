import { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type ClassMemberRow = {
  enrollment_state?: string | null
  user_id: string
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  return error?.code === '42703'
}

const CLASSES_SELECT_WITH_ENROLLMENT = `
  id,
  name,
  description,
  code,
  created_at,
  teacher_id,
  class_members!inner (
    role,
    user_id,
    enrollment_state,
    profiles (
      full_name,
      email
    )
  )
`

const CLASSES_SELECT_LEGACY = `
  id,
  name,
  description,
  code,
  created_at,
  teacher_id,
  class_members!inner (
    role,
    user_id,
    profiles (
      full_name,
      email
    )
  )
`

const CLASS_DETAIL_SELECT_WITH_ENROLLMENT = `
  id,
  name,
  description,
  code,
  class_code,
  created_at,
  teacher_id,
  class_members (
    role,
    user_id,
    enrollment_state,
    profiles (
      full_name,
      email
    )
  )
`

const CLASS_DETAIL_SELECT_LEGACY = `
  id,
  name,
  description,
  code,
  class_code,
  created_at,
  teacher_id,
  class_members (
    role,
    user_id,
    profiles (
      full_name,
      email
    )
  )
`

export async function listClassesForUser(supabase: SupabaseServerClient, userId: string) {
  const primaryQuery = await supabase
    .from('classes')
    .select(CLASSES_SELECT_WITH_ENROLLMENT)
    .eq('class_members.user_id', userId)
    .order('created_at', { ascending: false })

  if (primaryQuery.error && !isMissingColumnError(primaryQuery.error)) {
    throw primaryQuery.error
  }

  const legacyQuery = primaryQuery.error
    ? await supabase
        .from('classes')
        .select(CLASSES_SELECT_LEGACY)
        .eq('class_members.user_id', userId)
        .order('created_at', { ascending: false })
    : null

  if (legacyQuery?.error) {
    throw legacyQuery.error
  }

  const rows = primaryQuery.error ? legacyQuery?.data ?? [] : primaryQuery.data ?? []

  return rows.filter((classroom) =>
    Array.isArray(classroom.class_members) &&
    classroom.class_members.some(
      (member) =>
        ((member as ClassMemberRow).user_id === userId) &&
        (((member as ClassMemberRow).enrollment_state == null) ||
          (member as ClassMemberRow).enrollment_state === 'active')
    )
  )
}

export async function findClassById(supabase: SupabaseServerClient, classId: string) {
  const primaryQuery = await supabase
    .from('classes')
    .select(CLASS_DETAIL_SELECT_WITH_ENROLLMENT)
    .eq('id', classId)
    .maybeSingle()

  if (primaryQuery.error && !isMissingColumnError(primaryQuery.error)) {
    throw primaryQuery.error
  }

  const legacyQuery = primaryQuery.error
    ? await supabase
        .from('classes')
        .select(CLASS_DETAIL_SELECT_LEGACY)
        .eq('id', classId)
        .maybeSingle()
    : null

  if (legacyQuery?.error) {
    throw legacyQuery.error
  }

  return primaryQuery.error ? legacyQuery?.data ?? null : primaryQuery.data ?? null
}

export async function createClassroom(
  supabase: SupabaseServerClient,
  input: { description?: string | null; name: string }
) {
  const { data, error } = await supabase.rpc('create_classroom', {
    input_name: input.name,
    input_description: input.description ?? null,
  })

  if (error) {
    throw error
  }

  return data ?? null
}

export async function deleteClassroom(supabase: SupabaseServerClient, classId: string) {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) {
    throw error
  }
}

export async function joinClassByCode(supabase: SupabaseServerClient, code: string) {
  const { data, error } = await supabase.rpc('join_class_by_code', {
    input_code: code,
  })

  if (error) {
    throw error
  }

  return typeof data === 'string' ? (JSON.parse(data) as Record<string, unknown>) : data
}
