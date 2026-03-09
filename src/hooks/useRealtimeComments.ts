// hooks/useRealtimeComments.ts

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Comment } from '@/types/assignments'

export function useRealtimeComments(assignmentId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!assignmentId) return

    const supabase = createClient()

    // Fetch inicial de comentarios
    const fetchInitialComments = async () => {
      const { data, error } = await supabase
        .from('assignment_comments')
        .select(`
          id,
          assignment_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            full_name
          )
        `)
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        const formattedComments = data.map(comment => ({
          id: comment.id,
          assignment_id: comment.assignment_id,
          user_id: comment.user_id,
          user_name: 'Usuario',
          content: comment.content,
          created_at: comment.created_at
        })) as Comment[]

        setComments(formattedComments)
      }
    }

    fetchInitialComments()

    // Configurar suscripción Realtime
    const channel = supabase
      .channel(`comments:${assignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assignment_comments',
          filter: `assignment_id=eq.${assignmentId}`
        },
        async (payload) => {
          // Obtener información del usuario
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single()

          const newComment: Comment = {
            ...payload.new,
            user_name: userData?.full_name || 'Usuario'
          } as Comment

          setComments(prev => [...prev, newComment])
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
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single()

          const updatedComment: Comment = {
            ...payload.new,
            user_name: userData?.full_name || 'Usuario'
          } as Comment

          setComments(prev =>
            prev.map(c => (c.id === updatedComment.id ? updatedComment : c))
          )
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Cleanup
    return () => {
      channel.unsubscribe()
    }
  }, [assignmentId])

  return { comments, isConnected }
}