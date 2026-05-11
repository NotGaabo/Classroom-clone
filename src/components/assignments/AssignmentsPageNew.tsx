'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { AssignmentPage } from '@/types/assignments'

export default function AssignmentsPageNew() {
  const params = useParams()
  const class_id = params.classId as string

  const [assignments, setAssignments] = useState<AssignmentPage[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [points, setPoints] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const fetchAssignments = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch(`/api/assignments?class_id=${class_id}`)
      const payload = (await res.json().catch(() => null)) as
        | { data?: AssignmentPage[]; error?: { message?: string } }
        | null

      if (!res.ok) {
        throw new Error(payload?.error?.message || 'Error al cargar las asignaciones')
      }

      setAssignments(payload?.data ?? [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setFetching(false)
    }
  }, [class_id])

  useEffect(() => {
    if (class_id) {
      fetchAssignments()
    }
  }, [class_id, fetchAssignments])

  const createAssignments = async () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la asignación')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_id: class_id,
          title: name,
          description,
          due_date: dueDate || null,
          points: points ? parseInt(points) : null,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        alert(data?.error?.message || 'Error al crear la asignación')
        return
      }

      await fetchAssignments()

      setName('')
      setDescription('')
      setDueDate('')
      setPoints('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear la asignación')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (assignment: AssignmentPage) => {
    if (assignment.status === 'graded') {
      return {
        bg: 'var(--color-success-50)',
        text: 'var(--color-success-700)',
        label: 'Calificado',
      }
    } else if (assignment.status === 'submitted') {
      return {
        bg: 'var(--color-info-50)',
        text: 'var(--color-info-700)',
        label: 'Entregado',
      }
    } else {
      return {
        bg: 'var(--color-warning-50)',
        text: 'var(--color-warning-700)',
        label: 'Por entregar',
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Trabajo de clase
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {assignments.length} asignación{assignments.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva asignación
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Crear nueva asignación
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Título *
            </label>
            <input
              type="text"
              placeholder="Ej: Ensayo sobre la Revolución Francesa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Puntos
              </label>
              <input
                type="number"
                placeholder="100"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                disabled={loading}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Fecha de entrega
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Descripción/Instrucciones
            </label>
            <textarea
              placeholder="Añade instrucciones detalladas para los estudiantes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={5}
              className="input w-full resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowCreateForm(false)}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={createAssignments}
              disabled={loading || !name.trim()}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear asignación
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {fetching ? (
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Cargando asignaciones...</p>
          </div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
            No hay asignaciones aún
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Crea la primera asignación para los estudiantes
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const statusColor = getStatusColor(assignment)
            return (
              <div key={assignment.id} className="card overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6 space-y-4">
                  {/* Assignment Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-semibold line-clamp-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {assignment.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        {assignment.created_at && (
                          <span>Publicada {new Date(assignment.created_at).toLocaleDateString('es-ES')}</span>
                        )}
                        {assignment.points && (
                          <>
                            <span>•</span>
                            <span>{assignment.points} puntos</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                      }}
                    >
                      {statusColor.label}
                    </div>
                  </div>

                  {/* Description */}
                  {assignment.description && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {assignment.description}
                    </p>
                  )}

                  {/* Due Date */}
                  {assignment.due_date && (
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--color-neutral-200)' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        FECHA DE ENTREGA
                      </p>
                      <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                        {new Date(assignment.due_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
