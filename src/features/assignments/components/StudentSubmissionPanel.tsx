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
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-blue-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tu entrega</h2>
            <p className="text-sm text-slate-500">
              Sube documentos, PDFs, Word, imágenes, ZIP u otros archivos como en Classroom.
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
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Estado actual</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {currentSubmission ? 'Ya tienes una entrega guardada' : 'Aún no has entregado este trabajo'}
              </p>
            </div>
            {currentSubmission?.submitted_at && (
              <span className="text-xs font-medium text-slate-500">
                {formatShortDate(currentSubmission.submitted_at)}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Comentario o notas para el profesor
          </label>
          <textarea
            value={submissionText}
            onChange={(event) => onSetSubmissionText(event.target.value)}
            rows={5}
            className="w-full rounded-[22px] border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            placeholder="Explica qué estás entregando, instrucciones o contexto adicional..."
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Archivos de tu entrega
            </p>
            {currentFiles.length > 0 && (
              <span className="text-xs text-slate-500">
                {currentFiles.length} {currentFiles.length === 1 ? 'archivo guardado' : 'archivos guardados'}
              </span>
            )}
          </div>

          {currentFiles.length > 0 && <SubmissionFileList files={currentFiles} />}

          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Arrastra o selecciona archivos para tu entrega
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Puedes subir Word, PDF, imágenes, ZIP y otros archivos. Máximo 25 MB por archivo.
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                onSelectFiles(event.target.files)
                event.currentTarget.value = ''
              }}
            />
          </label>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSelectedFile(index)}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length > 0 && currentFiles.length > 0 && (
            <p className="mt-3 text-xs text-amber-700">
              Al guardar esta entrega, los archivos actuales se reemplazarán por los nuevos seleccionados.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onSubmitStudentWork}
            disabled={canSubmitStudentWork}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando entrega...' : studentHeaderLabel}
          </button>
        </div>

        <SubmissionFeedbackCard submission={currentSubmission} />
      </div>
    </div>
  )
}
