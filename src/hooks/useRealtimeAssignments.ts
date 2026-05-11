// hooks/useRealtimeAssignments.ts

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeManager } from '@/features/realtime/RealtimeManager'
import { Assignment } from '@/types/assignments'

export function useRealtimeAssignments(classId: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) return

    const supabase = createClient()

    // Fetch inicial de asignaciones
    const fetchInitialAssignments = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setAssignments(data as Assignment[])
      }
      setLoading(false)
    }

    fetchInitialAssignments()

    // Configurar suscripción Realtime
    const realtime = getRealtimeManager()

    const unsubscribe = realtime.subscribe({ channelName: `assignments:${classId}` }, (channel) =>
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'assignments',
            filter: `class_id=eq.${classId}`
          },
          (payload) => {
            setAssignments(prev => [payload.new as Assignment, ...prev])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'assignments',
            filter: `class_id=eq.${classId}`
          },
          (payload) => {
            setAssignments(prev =>
              prev.map(assignment =>
                assignment.id === payload.new.id
                  ? (payload.new as Assignment)
                  : assignment
              )
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'assignments',
            filter: `class_id=eq.${classId}`
          },
          (payload) => {
            setAssignments(prev =>
              prev.filter(assignment => assignment.id !== payload.old.id)
            )
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED')
        })
    )

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [classId])

  return { assignments, isConnected, loading, setAssignments }
}
