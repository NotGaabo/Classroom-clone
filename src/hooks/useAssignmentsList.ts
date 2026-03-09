import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Assignment } from '@/types/assignments'

export function useAssignmentsList() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!classId) return
    fetchAssignments()
    const unsub = setupRealtimeSubscription()
    return () => {
      unsub()
      createClient().channel('assignments-list').unsubscribe()
    }
  }, [classId])

  const fetchAssignments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/assignments?class_id=${classId}`)
      if (!res.ok) throw new Error()
      setAssignments(await res.json())
    } catch {
      setError('No se pudieron cargar las asignaciones')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = createClient()
      .channel('assignments-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments', filter: `class_id=eq.${classId}` },
        ({ eventType, new: n, old: o }) => {
          if (eventType === 'INSERT') setAssignments((p) => [n as Assignment, ...p])
          if (eventType === 'UPDATE') setAssignments((p) => p.map((a) => (a.id === n.id ? (n as Assignment) : a)))
          if (eventType === 'DELETE') setAssignments((p) => p.filter((a) => a.id !== o.id))
        }
      )
      .subscribe()
    return () => { channel.unsubscribe() }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  const isOverdue = (d: string) => new Date(d) < new Date()

    return {
      classId,  
      assignments,
      router,
      loading,
      error,
      fetchAssignments,
      formatDate,
      isOverdue
    }
}