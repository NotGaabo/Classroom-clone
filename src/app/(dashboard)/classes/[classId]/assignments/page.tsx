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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium">Cargando asignaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-l-4 border-red-600 rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 mb-1">Error al cargar</h3>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchAssignments}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Trabajo de clase
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {assignments.length} {assignments.length === 1 ? 'asignación' : 'asignaciones'}
              </p>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="relative flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                <div className="absolute w-3 h-3 rounded-full bg-green-500 opacity-30 animate-pulse"></div>
              </div>
              <span className="text-sm font-medium text-green-700">En vivo</span>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay asignaciones aún
              </h3>
              <p className="text-gray-600 text-sm">
                Las asignaciones aparecerán aquí cuando el profesor las publique
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <div
                key={assignment.id}
                onClick={() => handleAssignmentClick(assignment.id)}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`
                }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                          {assignment.title}
                        </h3>
                        
                        {assignment.points && (
                          <div className="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-full">
                            <span className="text-xs font-bold text-gray-700">
                              {assignment.points} pts
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {assignment.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {assignment.description}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {assignment.due_date && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className={isOverdue(assignment.due_date) ? 'text-red-600 font-semibold' : 'text-gray-700 font-medium'}>
                              {isOverdue(assignment.due_date) ? 'Vencida: ' : 'Entrega: '}
                              {formatDate(assignment.due_date)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Publicada {formatDate(assignment.created_at)}</span>
                        </div>

                        {assignment.status === 'submitted' && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Entregado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="flex-shrink-0 self-center">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Subtle bottom border on hover */}
                <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}