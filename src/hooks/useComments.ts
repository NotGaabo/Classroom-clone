'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeManager } from '@/features/realtime/RealtimeManager'
import { Comment } from '@/types/assignments'

interface UseCommentsOptions {
  enabled?: boolean
}

export function useComments(assignmentId: string, options: UseCommentsOptions = {}) {
  const { enabled = true } = options
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement | null>(null)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    if (!assignmentId || !enabled) {
      setComments([])
      return
    }

    const supabase = supabaseRef.current
    let isActive = true

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/assignments/${assignmentId}/comments`, {
          cache: 'no-store',
        })

        if (!res.ok) {
          return
        }

        const payload = (await res.json().catch(() => null)) as { data?: Comment[] } | null

        if (isActive) {
          setComments(payload?.data ?? [])
        }
      } catch {
        if (isActive) {
          setComments([])
        }
      }
    }

    fetchComments()

    const realtime = getRealtimeManager()

    const unsubscribe = realtime.subscribe({ channelName: `assignment-comments-${assignmentId}` }, (channel) =>
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'assignment_comments',
            filter: `assignment_id=eq.${assignmentId}`
          },
          async (payload) => {
            try {
              const { data: userData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', payload.new.user_id)
                .single()

              if (!isActive) {
                return
              }

              const nextComment: Comment = {
                id: payload.new.id,
                assignment_id: payload.new.assignment_id,
                user_id: payload.new.user_id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                user_name: userData?.full_name || 'Usuario'
              }

              setComments(prev => (prev.some((comment) => comment.id === nextComment.id) ? prev : [...prev, nextComment]))
            } catch {}
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'assignment_comments',
            filter: `assignment_id=eq.${assignmentId}`
          },
          (payload) => {
            setComments(prev => prev.filter(c => c.id !== payload.old.id))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'assignment_comments',
            filter: `assignment_id=eq.${assignmentId}`
          },
          async (payload) => {
            try {
              const { data: userData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', payload.new.user_id)
                .single()

              if (!isActive) {
                return
              }

              const updated: Comment = {
                id: payload.new.id,
                assignment_id: payload.new.assignment_id,
                user_id: payload.new.user_id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                user_name: userData?.full_name || 'Usuario'
              }

              setComments(prev => prev.map(c => (c.id === updated.id ? updated : c)))
            } catch {}
          }
        )
    )

    return () => {
      isActive = false
      unsubscribe()
    }

  }, [assignmentId, enabled])

  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [comments])

  const handleSubmitComment = async () => {
    if (!assignmentId || !enabled || !newComment.trim()) return

    setSubmitting(true)

    try {
      const res = await fetch(
        `/api/assignments/${assignmentId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newComment })
        }
      )

      if (res.ok) {
        setNewComment('')
        // Realtime manejará la actualización
      } else {
        console.error('Error al enviar comentario')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    comments,
    newComment,
    setNewComment,
    submitting,
    handleSubmitComment,
    commentsEndRef
  }
}
