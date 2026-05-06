'use client'

import { useEffect, useMemo, useState } from 'react'
import { Assignment, AssignmentSubmission, SubmissionAttachment } from '@/types/assignments'
import { formatDate, formatShortDate } from '@/utils/dateFormat'

interface Props {
  assignment: Assignment
  onRefresh: () => Promise<void>
}

type DraftMap = Record<string, { score: string; feedback: string }>

function FileList({ files }: { files: SubmissionAttachment[] }) {
  if (files.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        Sin archivos adjuntos en esta entrega.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <a
          key={file.id}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50/40"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {file.extension.toUpperCase()} • {file.size ? `${Math.round(file.size / 1024)} KB` : 'Archivo'}
            </p>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
            Abrir
          </span>
        </a>
      ))}
    </div>
  )
}

function SubmissionFeedback({ submission }: { submission: AssignmentSubmission | null | undefined }) {
  if (!submission?.feedback && submission?.score === null) {
    return null
  }

  return (
    <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
        Retroalimentación del profesor
      </p>
      {submission?.score !== null && submission?.score !== undefined && (
        <p className="mt-2 text-xl font-semibold text-slate-900">
          {submission.score}
        </p>
      )}
      {submission?.feedback && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {submission.feedback}
        </p>
      )}
    </div>
  )
}

export default function SubmissionWorkspace({ assignment, onRefresh }: Props) {
  const [submissionText, setSubmissionText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [grading, setGrading] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<DraftMap>({})

  useEffect(() => {
    setSubmissionText(assignment.own_submission?.content ?? '')
  }, [assignment.own_submission?.content])

  useEffect(() => {
    const nextDrafts = (assignment.submissions ?? []).reduce<DraftMap>((acc, submission) => {
      acc[submission.id] = {
        score:
          submission.score !== null && submission.score !== undefined
            ? String(submission.score)
            : '',
        feedback: submission.feedback ?? '',
      }
      return acc
    }, {})
    setDrafts(nextDrafts)
  }, [assignment.submissions])

  const currentSubmission = assignment.own_submission ?? null
  const currentFiles = currentSubmission?.files ?? []
  const canSubmitStudentWork =
    saving ||
    (!submissionText.trim() && selectedFiles.length === 0 && currentFiles.length === 0)

  const studentHeaderLabel = currentSubmission ? 'Volver a entregar' : 'Entregar trabajo'
  const submissionCount = assignment.submissions?.length ?? 0

  const sortedSubmissions = useMemo(() => {
    return [...(assignment.submissions ?? [])].sort((left, right) => {
      return new Date(right.submitted_at).getTime() - new Date(left.submitted_at).getTime()
    })
  }, [assignment.submissions])

  const handleStudentFiles = (files: FileList | null) => {
    if (!files) return
    setSelectedFiles((previous) => [...previous, ...Array.from(files)])
    setMessage(null)
  }

  const handleSubmitStudentWork = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.set('content', submissionText)
      selectedFiles.forEach((file) => formData.append('files', file))

      const response = await fetch(`/api/assignments/${assignment.id}/submission`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'No se pudo guardar la entrega',
        })
        return
      }

      setSelectedFiles([])
      setMessage({
        type: 'success',
        text: data.replaced_files
          ? 'Entrega actualizada correctamente. Los archivos anteriores fueron reemplazados.'
          : 'Entrega enviada correctamente.',
      })
      await onRefresh()
    } catch {
      setMessage({
        type: 'error',
        text: 'No se pudo conectar con el servidor para entregar el trabajo.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGradeChange = (submissionId: string, field: 'score' | 'feedback', value: string) => {
    setDrafts((previous) => ({
      ...previous,
      [submissionId]: {
        ...(previous[submissionId] ?? { score: '', feedback: '' }),
        [field]: value,
      },
    }))
  }

  const handleGradeSubmission = async (submission: AssignmentSubmission) => {
    const draft = drafts[submission.id] ?? { score: '', feedback: '' }
    setGrading((previous) => ({ ...previous, [submission.id]: true }))

    try {
      const response = await fetch(`/api/assignments/${assignment.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          score: draft.score,
          feedback: draft.feedback,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || `No se pudo calificar a ${submission.student_name}`,
        })
        return
      }

      setMessage({
        type: 'success',
        text: `Calificación guardada para ${submission.student_name}.`,
      })
      await onRefresh()
    } catch {
      setMessage({
        type: 'error',
        text: `No se pudo guardar la calificación de ${submission.student_name}.`,
      })
    } finally {
      setGrading((previous) => ({ ...previous, [submission.id]: false }))
    }
  }

  if (assignment.my_role === 'teacher') {
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
                    <FileList files={submission.files ?? []} />
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
                        onChange={(event) => handleGradeChange(submission.id, 'score', event.target.value)}
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
                        onChange={(event) => handleGradeChange(submission.id, 'feedback', event.target.value)}
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
                      onClick={() => handleGradeSubmission(submission)}
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
            onChange={(event) => setSubmissionText(event.target.value)}
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

          {currentFiles.length > 0 && <FileList files={currentFiles} />}

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
                handleStudentFiles(event.target.files)
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
                    onClick={() => setSelectedFiles((previous) => previous.filter((_, currentIndex) => currentIndex !== index))}
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
            onClick={handleSubmitStudentWork}
            disabled={canSubmitStudentWork}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando entrega...' : studentHeaderLabel}
          </button>
        </div>

        <SubmissionFeedback submission={currentSubmission} />
      </div>
    </div>
  )
}
