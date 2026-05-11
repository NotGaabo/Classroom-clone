import { Assignment } from '@/types/assignments'

interface AssignmentsFeedProps {
  assignments: Assignment[]
  error: string | null
  fetchAssignments: () => Promise<void>
  formatDate: (value: string) => string
  isOverdue: (value: string) => boolean
  loading: boolean
  role: 'teacher' | 'student' | null
  onOpenAssignment: (assignmentId: string) => void
}

export function AssignmentsFeed({
  assignments,
  error,
  fetchAssignments,
  formatDate,
  isOverdue,
  loading,
  role,
  onOpenAssignment,
}: AssignmentsFeedProps) {
  if (loading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-[24px] border border-slate-200 bg-white/90">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
        <p className="text-sm text-slate-500">Cargando asignaciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-200 bg-white/90 p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">No se pudo cargar</h3>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button
              onClick={fetchAssignments}
              className="mt-4 rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white/75 px-6 py-20 text-center">
        <div
          className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-blue-600"
          style={{ width: 72, height: 72 }}
        >
          <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Todavía no hay tareas</h3>
        <p className="mt-2 text-sm text-slate-500">
          {role === 'teacher'
            ? 'Crea tu primera asignación para comenzar a organizar el trabajo de esta clase.'
            : 'Las asignaciones aparecerán aquí cuando el profesor publique contenido.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {assignments.map((assignment, index) => (
        <article
          key={assignment.id}
          onClick={() => onOpenAssignment(assignment.id)}
          className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)] sm:p-6"
          style={{ animation: `cardIn 0.3s ease-out ${index * 0.05}s backwards` }}
        >
          <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[linear-gradient(90deg,#2563eb,#0ea5e9)] transition-transform duration-300 group-hover:scale-x-100" />

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0284c7)] text-white shadow-[0_10px_18px_rgba(37,99,235,0.28)]">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                  {assignment.title}
                </h3>
                {assignment.points !== null && assignment.points !== undefined && (
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.72rem] font-semibold text-slate-600">
                    {assignment.points} pts
                  </span>
                )}
              </div>

              {assignment.description && (
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">
                  {assignment.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                {assignment.due_date && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${isOverdue(assignment.due_date) ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-700'}`}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isOverdue(assignment.due_date) ? 'Vencida' : 'Entrega'} {formatDate(assignment.due_date)}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Publicada {formatDate(assignment.created_at)}
                </span>
              </div>
            </div>

            <svg className="mt-1 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </article>
      ))}

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
