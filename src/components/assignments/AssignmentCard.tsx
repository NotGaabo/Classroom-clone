'use client'

import { Assignment } from '@/types/assignments'
import { formatDate, formatShortDate } from '@/utils/dateFormat'

interface Props {
  assignment: Assignment
}

function getStatusMeta(status: Assignment['status']) {
  switch (status) {
    case 'graded':
      return {
        badge: 'Calificado',
        classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        icon: '✓',
      }
    case 'submitted':
      return {
        badge: 'Entregado',
        classes: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
        icon: '✓',
      }
    default:
      return {
        badge: 'Sin entregar',
        classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        icon: '!',
      }
  }
}

export default function AssignmentCard({ assignment }: Props) {
  const statusMeta = getStatusMeta(assignment.status)

  return (
    <article 
      className="rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden"
      style={{
        borderColor: 'var(--color-neutral-200)',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      {/* Header Section */}
      <div className="border-b p-6 sm:p-8" style={{ borderColor: 'var(--color-neutral-200)' }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          {/* Title & Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div className="min-w-0">
                <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {assignment.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Profesor
                  </span>
                  <span className="hidden text-gray-300 sm:inline">•</span>
                  <span>Publicada {formatShortDate(assignment.created_at)}</span>
                  {assignment.points !== null && assignment.points !== undefined && (
                    <>
                      <span className="hidden text-gray-300 sm:inline">•</span>
                      <span>{assignment.points} puntos</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Due Date & Status */}
          <div className="flex flex-col items-start gap-3 lg:items-end">
            {assignment.due_date && (
              <div
                className="rounded-2xl border px-4 py-3 text-left lg:text-right"
                style={{
                  borderColor: 'var(--color-neutral-200)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  Fecha de entrega
                </p>
                <p className="mt-1 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(assignment.due_date)}
                </p>
              </div>
            )}
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusMeta.classes}`}>
              {statusMeta.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          {/* Instructions */}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>
              Instrucciones
            </p>
            <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {assignment.description?.trim() || 'El profesor no ha añadido instrucciones adicionales para esta actividad.'}
            </div>
          </div>

          {/* Quick Summary Sidebar */}
          <div
            className="space-y-3 rounded-2xl border p-4"
            style={{
              borderColor: 'var(--color-neutral-200)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)' }}>
                Resumen rápido
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Estado
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {statusMeta.badge}
              </p>
            </div>

            {assignment.score !== null && assignment.score !== undefined && (
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Tu calificación
                </p>
                <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {assignment.score}
                  {assignment.points !== null && assignment.points !== undefined ? ` / ${assignment.points}` : ''}
                </p>
              </div>
            )}

            {assignment.due_date && (
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Entrega
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatShortDate(assignment.due_date)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
