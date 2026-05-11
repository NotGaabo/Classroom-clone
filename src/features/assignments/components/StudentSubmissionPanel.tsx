import { useId } from 'react'
import { AssignmentSubmission } from '@/types/assignments'
import { formatShortDate } from '@/utils/dateFormat'
import { SubmissionFeedbackCard } from '@/features/assignments/components/SubmissionFeedbackCard'
import { SubmissionFileList } from '@/features/assignments/components/SubmissionFileList'

interface StudentSubmissionPanelProps {
  canSubmitStudentWork: boolean
  currentFiles: NonNullable<AssignmentSubmission['files']>
  currentSubmission: AssignmentSubmission | null
  message: { type: 'success' | 'error'; text: string } | null
  saving: boolean
  selectedFiles: File[]
  studentHeaderLabel: string
  submissionText: string
  onRemoveSelectedFile: (index: number) => void
  onSelectFiles: (files: FileList | null) => void
  onSetSubmissionText: (value: string) => void
  onSubmitStudentWork: () => void
}

export function StudentSubmissionPanel({
  canSubmitStudentWork,
  currentFiles,
  currentSubmission,
  message,
  saving,
  selectedFiles,
  studentHeaderLabel,
  submissionText,
  onRemoveSelectedFile,
  onSelectFiles,
  onSetSubmissionText,
  onSubmitStudentWork,
}: StudentSubmissionPanelProps) {
  const inputId = useId()
  const hasExistingSubmission = Boolean(currentSubmission)
  const statusLabel = hasExistingSubmission ? 'Entregado' : 'Sin entregar'
  const statusClasses = hasExistingSubmission
    ? 'text-sky-700'
    : 'text-rose-600'

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.75rem] font-normal tracking-[-0.03em] text-slate-950">
              Tu trabajo
            </h2>
            <span className={`text-sm font-medium ${statusClasses}`}>{statusLabel}</span>
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

          <div className="mt-5 space-y-4">
            <label
              htmlFor={inputId}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-400 px-4 py-3 text-base font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir o crear
            </label>
            <input
              id={inputId}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                onSelectFiles(event.target.files)
                event.currentTarget.value = ''
              }}
            />

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{Math.round(file.size / 1024)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSelectedFile(index)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {currentFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Entregado
                </p>
                <SubmissionFileList files={currentFiles} />
              </div>
            )}

            <button
              type="button"
              onClick={onSubmitStudentWork}
              disabled={canSubmitStudentWork}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-200 px-5 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : studentHeaderLabel}
            </button>

            {currentSubmission?.submitted_at && (
              <p className="text-center text-sm italic text-slate-500">
                Última entrega: {formatShortDate(currentSubmission.submitted_at)}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m10 0V6a4 4 0 10-8 0v2m8 0H7" />
            </svg>
            <h3 className="text-lg font-medium text-slate-950">Comentarios privados</h3>
          </div>

          <textarea
            value={submissionText}
            onChange={(event) => onSetSubmissionText(event.target.value)}
            rows={4}
            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            placeholder="Añadir comentario para el profesor"
          />

          <div className="mt-4">
            <SubmissionFeedbackCard submission={currentSubmission} />
          </div>
        </div>
      </section>
    </div>
  )
}
