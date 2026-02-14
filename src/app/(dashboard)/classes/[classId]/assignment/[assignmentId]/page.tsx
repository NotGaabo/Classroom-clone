'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Assignment, Comment } from '@/types/assignments'

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string
  const assignmentId = params.assignmentId as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails()
      fetchComments()
      setupRealtimeSubscriptions()
    }

    // Cleanup
    return () => {
      const supabase = createClient()
      supabase.channel('assignment-detail').unsubscribe()
      supabase.channel('assignment-comments').unsubscribe()
    }
  }, [assignmentId])

  const setupRealtimeSubscriptions = () => {
    const supabase = createClient()

    // Suscripción para cambios en la asignación
    const assignmentChannel = supabase
      .channel('assignment-detail')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'assignments',
          filter: `id=eq.${assignmentId}`
        },
        (payload) => {
          console.log('Assignment updated:', payload)
          setAssignment(payload.new as Assignment)
        }
      )
      .subscribe((status) => {
        console.log('Assignment subscription status:', status)
        setIsOnline(status === 'SUBSCRIBED')
      })

    // Suscripción para comentarios en tiempo real
    const commentsChannel = supabase
      .channel('assignment-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assignment_comments',
          filter: `assignment_id=eq.${assignmentId}`
        },
        async (payload) => {
          console.log('New comment:', payload)
          
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
          
          // Auto scroll al nuevo comentario
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
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
          console.log('Comment deleted:', payload)
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
          console.log('Comment updated:', payload)
          
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
        console.log('Comments subscription status:', status)
      })
  }

  const fetchAssignmentDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`)
      
      if (!res.ok) {
        throw new Error('Error al cargar la asignación')
      }

      const data = await res.json()
      setAssignment(data)
    } catch (err) {
      console.error('Error fetching assignment:', err)
      setError('No se pudo cargar la asignación')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/comments`)
      
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (err) {
      console.error('Error fetching comments:', err)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setSubmitting(true)

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      })

      if (!res.ok) {
        throw new Error('Error al enviar el comentario')
      }

      // El comentario se agregará automáticamente vía realtime
      setNewComment('')
    } catch (err) {
      console.error('Error submitting comment:', err)
      alert('No se pudo enviar el comentario')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando asignación...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error || 'Asignación no encontrada'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header con botón de retroceso */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Volver a Trabajo de clase</span>
        </button>

        {/* Indicador de estado en línea */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-gray-600">{isOnline ? 'En vivo' : 'Sin conexión'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card principal de la asignación */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header con icono */}
            <div className="bg-blue-600 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {assignment.title}
                </h1>
                <p className="text-blue-100 text-sm">
                  Publicada el {formatShortDate(assignment.created_at)}
                </p>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {assignment.description ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Sin descripción</p>
              )}
            </div>
          </div>

          {/* Sección de comentarios */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Comentarios de clase
              {comments.length > 0 && (
                <span className="text-sm text-gray-500">({comments.length})</span>
              )}
            </h2>

            {/* Lista de comentarios */}
            <div className="max-h-96 overflow-y-auto mb-6">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 animate-fadeIn">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">
                              {comment.user_name || 'Usuario'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatShortDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              )}
            </div>

            {/* Input para nuevo comentario */}
            <div className="flex gap-3 border-t pt-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !submitting) {
                      handleSubmitComment()
                    }
                  }}
                  placeholder="Añade un comentario de clase..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isOnline || submitting}
                />
                {newComment.trim() && (
                  <button
                    onClick={handleSubmitComment}
                    disabled={submitting || !isOnline}
                    className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barra lateral */}
        <div className="space-y-4">
          {/* Card de fecha de entrega */}
          {assignment.due_date && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Fecha de entrega</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(assignment.due_date)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card de tu trabajo */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Tu trabajo
            </h3>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Agregar o crear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}