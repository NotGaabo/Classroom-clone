// src/hooks/useAssignments.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRealtimeManager } from '@/features/realtime/RealtimeManager'
import { Assignment } from '@/types/assignments'

export function useAssignment(assignmentId: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const fetchAssignment = useCallback(async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`)
      if (!res.ok) {
        console.log('Status:', res.status)
        const text = await res.text()
        console.log('Response:', text)
        throw new Error(`Failed to fetch assignment: ${res.status}`)
      }

      const data = await res.json()
      setAssignment(data)
    } catch {
      setError('No se pudo cargar la asignación')
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    if (!assignmentId) return

    fetchAssignment()

    const realtime = getRealtimeManager()

    return realtime.subscribe({ channelName: `assignment-detail:${assignmentId}` }, (channel) =>
      channel
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'assignments',
            filter: `id=eq.${assignmentId}`
          },
          (payload) => {
            setAssignment(payload.new as Assignment)
          }
        )
        .subscribe((status) => {
          setIsOnline(status === 'SUBSCRIBED')
        })
    )
  }, [assignmentId, fetchAssignment])

  return { assignment, loading, error, isOnline, refreshAssignment: fetchAssignment }
}
