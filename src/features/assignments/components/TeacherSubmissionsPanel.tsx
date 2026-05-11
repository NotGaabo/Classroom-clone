import { Assignment, AssignmentSubmission } from '@/types/assignments'
import { formatDate, formatShortDate } from '@/utils/dateFormat'
import { SubmissionFileList } from '@/features/assignments/components/SubmissionFileList'

interface TeacherSubmissionsPanelProps {
  assignment: Assignment
  drafts: Record<string, { score: string; feedback: string }>
  grading: Record<string, boolean>
  message: { type: 'success' | 'error'; text: string } | null
  sortedSubmissions: AssignmentSubmission[]
  submissionCount: number
  onGradeChange: (submissionId: string, field: 'score' | 'feedback', value: string) => void
  onGradeSubmission: (submissionId: string, studentName: string) => void
}

export function TeacherSubmissionsPanel({
  assignment,
  drafts,
  grading,
  message,
  sortedSubmissions,
  submissionCount,
  onGradeChange,
  onGradeSubmission,
}: TeacherSubmissionsPanelProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0013.172 1H8a2 2 0 00-2 2v16a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Entregas de estudiantes</h2>
            <p className="text-sm text-slate-500">
              {submissionCount} {submissionCount === 1 ? 'entrega recibida' : 'entregas recibidas'}
            </p>
          </div>
        </div>
        {message && (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="space-y-5 px-6 py-6">
        {sortedSubmissions.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Todavía no hay entregas de estudiantes en esta asignación.
          </div>
        ) : (
          sortedSubmissions.map((submission) => {
            const draft = drafts[submission.id] ?? { score: '', feedback: '' }
            const isSavingGrade = grading[submission.id] === true

            return (
              <div
                key={submission.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{submission.student_name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Entregado el {formatDate(submission.submitted_at)}
                    </p>
                  </div>
                  <div className="inline-flex w-max items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                    {submission.score !== null && submission.score !== undefined ? 'Calificado' : 'Sin calificar'}
                  </div>
                </div>

                {submission.content && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Comentario del estudiante
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {submission.content}
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Archivos entregados
                  </p>
                  <SubmissionFileList files={submission.files ?? []} />
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[180px,1fr]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Nota
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={assignment.points ?? undefined}
                      step={1}
                      value={draft.score}
                      onChange={(event) => onGradeChange(submission.id, 'score', event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      placeholder={assignment.points ? `0 - ${assignment.points}` : 'Ej. 85'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Retroalimentación
                    </label>
                    <textarea
                      value={draft.feedback}
                      onChange={(event) => onGradeChange(submission.id, 'feedback', event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      placeholder="Explica fortalezas, correcciones o próximos pasos..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {submission.graded_at
                      ? `Última actualización: ${formatShortDate(submission.graded_at)}`
                      : 'Aún no se ha guardado una nota para esta entrega.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onGradeSubmission(submission.id, submission.student_name)}
                    disabled={isSavingGrade}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingGrade ? 'Guardando...' : 'Guardar calificación'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
