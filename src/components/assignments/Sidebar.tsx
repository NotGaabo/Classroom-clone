'use client'

import { Assignment } from '@/types/assignments'
import { formatDate } from '@/utils/dateFormat'

interface Props {
  assignment: Assignment
}

export default function Sidebar({ assignment }: Props) {
  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
  const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded'
  const isGraded = assignment.status === 'graded'
  const statusClasses = isGraded
    ? 'bg-emerald-100 text-emerald-700'
    : isSubmitted
      ? 'bg-sky-100 text-sky-700'
      : 'bg-amber-100 text-amber-700'
  const statusLabel = isGraded ? 'Calificado' : isSubmitted ? 'Entregado' : 'Pendiente'
  
  return (
    <div className="space-y-4">
      {/* Due Date Card */}
      {assignment.due_date && (
        <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fecha de entrega
              </span>
            </div>
            <p className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
              {formatDate(assignment.due_date)}
            </p>
            {isOverdue && (
              <span className="mt-2 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                Vencido
              </span>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-slate-900">
              {assignment.my_role === 'teacher' ? 'Seguimiento' : 'Tu trabajo'}
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium text-slate-600">Estado</span>
              {isSubmitted ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${statusClasses}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {statusLabel}
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${statusClasses}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {statusLabel}
                </span>
              )}
            </div>

            {assignment.score !== null && assignment.score !== undefined && (
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Puntaje</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {assignment.score}
                  {assignment.points !== null && assignment.points !== undefined ? ` / ${assignment.points}` : ''}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              {assignment.my_role === 'teacher'
                ? 'Los adjuntos y entregas se gestionan desde esta asignación.'
                : 'Los archivos compartidos por el profesor aparecen en esta misma página.'}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
        <div className="px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Información
          </h3>
          
          <div className="space-y-3 text-sm">
            {assignment.points !== null && assignment.points !== undefined && (
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-gray-600 text-xs">Puntos</p>
                  <p className="font-semibold text-gray-900">{assignment.points}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-gray-600 text-xs">Publicado</p>
                <p className="font-medium text-gray-900">{formatDate(assignment.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
