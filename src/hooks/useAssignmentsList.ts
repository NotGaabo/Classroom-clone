import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeManager } from '@/features/realtime/RealtimeManager'
import { Assignment, AssignmentRole } from '@/types/assignments'
import { parseDateString } from '@/utils/dateFormat'

export function useAssignmentsList() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<AssignmentRole | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  const fetchRole = useCallback(async () => {
    setRoleLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setRole(null)
        return
      }

      const { data, error: roleError } = await supabase
        .from('class_members')
        .select('role')
        .eq('class_id', classId)
        .eq('user_id', user.id)
        .single()

      if (roleError) {
        console.error('Error fetching role:', roleError)
        setRole(null)
        return
      }

      setRole((data?.role as AssignmentRole) ?? null)
    } catch (fetchError) {
      console.error('Error fetching role:', fetchError)
      setRole(null)
    } finally {
      setRoleLoading(false)
    }
  }, [classId])

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/assignments?class_id=${classId}`)
      const payload = (await res.json().catch(() => null)) as
        | { data?: Assignment[]; error?: { message?: string } }
        | null

      if (!res.ok) {
        throw new Error(payload?.error?.message || 'No se pudieron cargar las asignaciones')
      }

      setAssignments(payload?.data ?? [])
    } catch {
      setError('No se pudieron cargar las asignaciones')
    } finally {
      setLoading(false)
    }
  }, [classId])

  const normalizeAssignment = (assignment: Assignment) => ({
    ...assignment,
    status: assignment.status ?? 'not_submitted',
  })

  const setupRealtimeSubscription = useCallback(() => {
    const realtime = getRealtimeManager()

    return realtime.subscribe({ channelName: `assignments:${classId}` }, (channel) =>
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments', filter: `class_id=eq.${classId}` },
        ({ eventType, new: n, old: o }) => {
          if (eventType === 'INSERT') setAssignments((p) => [normalizeAssignment(n as Assignment), ...p])
          if (eventType === 'UPDATE') {
            setAssignments((p) =>
              p.map((a) => (a.id === n.id ? { ...normalizeAssignment(n as Assignment), status: a.status } : a))
            )
          }
          if (eventType === 'DELETE') setAssignments((p) => p.filter((a) => a.id !== o.id))
        }
      )
    )
  }, [classId])

  useEffect(() => {
    if (!classId) return

    fetchAssignments()
    fetchRole()

    const unsubscribe = setupRealtimeSubscription()

    return () => {
      unsubscribe()
    }
  }, [classId, fetchAssignments, fetchRole, setupRealtimeSubscription])

  const formatDate = (d: string) =>
    parseDateString(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  const isOverdue = (d: string) => parseDateString(d) < new Date()

  return {
    classId,
    assignments,
    router,
    loading,
    error,
    fetchAssignments,
    formatDate,
    isOverdue,
    role,
    roleLoading,
  }
}
