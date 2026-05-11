'use client'

import { Assignment } from '@/types/assignments'
import { formatDate, formatShortDate } from '@/utils/dateFormat'

interface Props {
  assignment: Assignment
}

function getStatusMeta(assignment: Assignment) {
  if (assignment.status === 'graded') {
    return {
      label: 'Calificado',
      classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    }
  }

  if (assignment.status === 'submitted') {
    return {
      label: 'Entregado',
      classes: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    }
  }

  return {
    label: 'Sin entregar',
    classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  }
}

export default function Sidebar({ assignment }: Props) {
  const statusMeta = getStatusMeta(assignment)
  const isTeacherView = assignment.my_role === 'teacher'
  const submittedAt = assignment.own_submission?.submitted_at ?? null

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-950">
                {isTeacherView ? 'Resumen de la actividad' : 'Tu trabajo'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {isTeacherView
                  ? 'Panel rápido para revisar fechas y estado general.'
                  : 'Todo lo importante antes de entregar.'}
              </p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusMeta.classes}`}>
              {statusMeta.label}
            </span>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5">
          {assignment.due_date && (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Fecha de entrega</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(assignment.due_date)}</p>
            </div>
          )}

          {assignment.points !== null && assignment.points !== undefined && (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Puntaje máximo</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{assignment.points} puntos</p>
            </div>
          )}

          {!isTeacherView && submittedAt && (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Última entrega</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{formatShortDate(submittedAt)}</p>
            </div>
          )}

          {assignment.score !== null && assignment.score !== undefined && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
              <p className="text-xs font-medium text-emerald-700">Calificación</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {assignment.score}
                {assignment.points !== null && assignment.points !== undefined ? ` / ${assignment.points}` : ''}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
