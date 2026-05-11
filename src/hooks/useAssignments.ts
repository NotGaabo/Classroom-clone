// src/hooks/useAssignments.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRealtimeManager } from '@/features/realtime/RealtimeManager'
import { Assignment } from '@/types/assignments'

function getRequestErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === 'object') {
    const responseError = 'error' in payload ? payload.error : null

    if (typeof responseError === 'string' && responseError.trim()) {
      return responseError
    }

    if (
      responseError &&
      typeof responseError === 'object' &&
      'message' in responseError &&
      typeof responseError.message === 'string' &&
      responseError.message.trim()
    ) {
      return responseError.message
    }
  }

  if (status === 503) {
    return 'Supabase no respondió. Intenta de nuevo en unos segundos.'
  }

  return `No se pudo cargar la asignación (HTTP ${status})`
}

export function useAssignment(assignmentId: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const fetchAssignment = useCallback(async () => {
    if (!assignmentId) {
      setAssignment(null)
      setLoading(false)
      setError('Falta el identificador de la asignación')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        cache: 'no-store',
      })
      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getRequestErrorMessage(payload, res.status))
      }

      setAssignment(payload as Assignment)
      setIsOnline(true)
    } catch (error) {
      setAssignment(null)
      setIsOnline(false)
      setError(error instanceof Error ? error.message : 'No se pudo cargar la asignación')
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    if (!assignmentId) return

    fetchAssignment()
  }, [assignmentId, fetchAssignment])

  useEffect(() => {
    if (!assignmentId || !assignment) return

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
  }, [assignment, assignmentId])

  return { assignment, loading, error, isOnline, refreshAssignment: fetchAssignment }
}
