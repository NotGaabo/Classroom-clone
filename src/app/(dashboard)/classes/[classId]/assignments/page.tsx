'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Assignment } from '@/types/assignments'

export default function AssignmentsListPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (classId) {
      fetchAssignments()
      setupRealtimeSubscription()
    }

    // Cleanup
    return () => {
      const supabase = createClient()
      supabase.channel('assignments-list').unsubscribe()
    }
  }, [classId])

  const fetchAssignments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/assignments?class_id=${classId}`)
      
      if (!res.ok) {
        throw new Error('Error al cargar las asignaciones')
      }

      const data = await res.json()
      setAssignments(data)
    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError('No se pudieron cargar las asignaciones')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const supabase = createClient()

    const channel = supabase
      .channel('assignments-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `class_id=eq.${classId}`
        },
        (payload) => {
          console.log('Realtime event:', payload)

          if (payload.eventType === 'INSERT') {
            setAssignments(prev => [payload.new as Assignment, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAssignments(prev =>
              prev.map(assignment =>
                assignment.id === payload.new.id
                  ? (payload.new as Assignment)
                  : assignment
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setAssignments(prev =>
              prev.filter(assignment => assignment.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const handleAssignmentClick = (assignmentId: string) => {
    router.push(`/classes/${classId}/assignment/${assignmentId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando asignaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchAssignments}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trabajo de clase
          </h1>
          <p className="text-gray-600">
            {assignments.length} {assignments.length === 1 ? 'asignación' : 'asignaciones'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>En vivo</span>
        </div>
      </div>

      {/* Lista de asignaciones */}
      {assignments.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay asignaciones aún
            </h3>
            <p className="text-gray-600">
              Las asignaciones aparecerán aquí cuando el profesor las publique
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => handleAssignmentClick(assignment.id)}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 cursor-pointer group animate-fadeIn"
            >
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {assignment.title}
                  </h3>
                  
                  {assignment.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    {assignment.due_date && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={isOverdue(assignment.due_date) ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {isOverdue(assignment.due_date) ? 'Vencida el ' : 'Entrega: '}
                          {formatDate(assignment.due_date)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span>Publicada el {formatDate(assignment.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Chevron */}
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}