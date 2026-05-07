'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Assignment } from '@/types/assignments'
import { FileMetadata } from '@/types/file'
import { formatDate } from '@/utils/dateFormat'
import { detectFileType, getFileExtension, getFileName, getMimeType } from '@/utils/fileDetection'
import { FileViewer } from '@/components/common/FileViewer'

interface Props {
  assignment: Assignment
  onRefresh?: () => Promise<void>
}

interface GradeFormState {
  score: string
  feedback: string
  submitting: boolean
  error?: string | null
  success?: string | null
}

export default function Sidebar({ assignment, onRefresh }: Props) {
  const [content, setContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [gradeForms, setGradeForms] = useState<Record<string, GradeFormState>>({})

  const isOverdue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false
  const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded'
  const isGraded = assignment.status === 'graded'
  const isTeacher = assignment.my_role === 'teacher'
  const submission = assignment.submissions?.[0] ?? null

  useEffect(() => {
    if (submission) {
      setContent(submission.content ?? '')
    } else {
      setContent('')
    }
  }, [submission])

  useEffect(() => {
    if (!assignment.submissions?.length) {
      setGradeForms({})
      return
    }

    const initialState = assignment.submissions.reduce<Record<string, GradeFormState>>(
      (state, item) => {
        state[item.id] = {
          score: item.score !== null && item.score !== undefined ? String(item.score) : '',
          feedback: item.feedback ?? '',
          submitting: false,
          error: null,
          success: null,
        }
        return state
      },
      {}
    )

    setGradeForms(initialState)
  }, [assignment.submissions])

  const stripFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_')

  const createSubmissionFileMetadata = (url: string, path?: string | null): FileMetadata => {
    const source = path || url
    const encodedName = getFileName(source)
    const name = decodeURIComponent(encodedName).replace(/^\d+_/, '')
    const extension = getFileExtension(source)

    return {
      name,
      type: detectFileType(source),
      extension,
      mimeType: getMimeType(extension),
      url,
    }
  }

  const uploadFileToStorage = async (file: File) => {
    const supabase = createClient()
    const safeName = `${Date.now()}_${stripFileName(file.name)}`
    const path = `assignments/${assignment.id}/${safeName}`

    const { data, error } = await supabase.storage
      .from('assignment-submissions')
      .upload(path, file, { upsert: true })

    if (error) {
      throw new Error(error.message || 'Error al subir el archivo')
    }

    return data.path
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError(null)
    setSubmitSuccess(null)
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)
    setIsSubmitting(true)

    try {
      let screenshotPath: string | null = null

      if (selectedFile) {
        screenshotPath = await uploadFileToStorage(selectedFile)
      }

      if (!content.trim() && !screenshotPath) {
        throw new Error('Debes escribir un comentario o subir un archivo antes de entregar.')
      }

      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          content: content.trim() || null,
          simulator_module: null,
          screenshot_path: screenshotPath,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo enviar la entrega')
      }

      setSubmitSuccess('Entrega registrada correctamente.')
      setSelectedFile(null)
      setSubmitError(null)
      await onRefresh?.()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al enviar la entrega.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateGradeForm = (submissionId: string, updates: Partial<GradeFormState>) => {
    setGradeForms((current) => ({
      ...current,
      [submissionId]: {
        ...(current[submissionId] ?? {
          score: '',
          feedback: '',
          submitting: false,
          error: null,
          success: null,
        }),
        ...updates,
      },
    }))
  }

  const handleGradeSubmit = async (submissionId: string) => {
    const current = gradeForms[submissionId]
    if (!current) return

    const scoreValue = current.score.trim()
    if (scoreValue.length === 0) {
      updateGradeForm(submissionId, { error: 'Ingresa una calificación numérica.' })
      return
    }

    const parsedScore = Number(scoreValue)
    if (Number.isNaN(parsedScore) || parsedScore < 0) {
      updateGradeForm(submissionId, { error: 'La calificación debe ser un número válido mayor o igual a 0.' })
      return
    }

    updateGradeForm(submissionId, { submitting: true, error: null, success: null })

    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'grade',
          submission_id: submissionId,
          score: parsedScore,
          feedback: current.feedback.trim() || null,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo guardar la calificación.')
      }

      updateGradeForm(submissionId, { submitting: false, success: 'Calificación guardada.', error: null })
      await onRefresh?.()
    } catch (error) {
      updateGradeForm(submissionId, {
        submitting: false,
        error:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error al guardar la calificación.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isTeacher ? 'Seguimiento de la asignación' : 'Tu entrega'}</p>
              <h2 className="text-lg font-semibold text-slate-900">{isTeacher ? 'Acciones para el profesor' : 'Enviar tarea'}</h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <p>
              {isTeacher
                ? 'Evalúa las entregas de los estudiantes y registra las calificaciones aquí.'
                : 'Carga tu respuesta, sube un archivo y envía tu trabajo para esta asignación.'}
            </p>
            {assignment.due_date && (
              <p>
                Fecha de entrega: <span className="font-semibold text-slate-900">{formatDate(assignment.due_date)}</span>
              </p>
            )}
            {isOverdue && !isGraded && (
              <p className="text-rose-600">Esta tarea ya venció, pero aún puedes entregar si lo permite el profesor.</p>
            )}
          </div>
        </div>
      </div>

      {!isTeacher && (
        <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
          <div className="px-5 py-5 space-y-4">
            {submission ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Entrega registrada</p>
                    <p className="text-xs text-slate-500">Enviada el {formatDate(submission.submitted_at)}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{isGraded ? 'Calificada' : 'Entregada'}</span>
                </div>
                {submission.screenshot_url && (
                  <div className="mt-4 rounded-2xl bg-white p-4 border border-slate-200">
                    <p className="text-sm font-medium text-slate-900">Archivo adjunto</p>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <FileViewer
                        file={createSubmissionFileMetadata(submission.screenshot_url, submission.screenshot_path)}
                        height="420px"
                      />
                    </div>
                  </div>
                )}
                {submission.score !== null && submission.score !== undefined && (
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                    <p className="text-sm font-semibold text-emerald-800">Calificación</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{submission.score}{assignment.points ? ` / ${assignment.points}` : ''}</p>
                    {submission.feedback && <p className="mt-2 text-sm text-slate-700">Feedback: {submission.feedback}</p>}
                  </div>
                )}
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <label htmlFor="student-content" className="text-sm font-semibold text-slate-900">Notas de entrega</label>
                <textarea
                  id="student-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Describe tu entrega, agrega comentarios o explica tu trabajo..."
                  disabled={isGraded}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">Adjuntar archivo</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={isGraded}
                  className="mt-2 block w-full text-sm text-slate-600"
                />
              </div>

              {submitError && (
                <p className="text-sm text-rose-600">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-sm text-emerald-600">{submitSuccess}</p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGraded || isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submission ? (isGraded ? 'Entrega cerrada' : isSubmitting ? 'Actualizando...' : 'Actualizar entrega') : isSubmitting ? 'Enviando...' : 'Enviar tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTeacher && (
        <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
          <div className="px-5 py-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Entregas de estudiantes</p>
              <h2 className="text-lg font-semibold text-slate-900">Revisar entregas</h2>
            </div>

            {assignment.submissions && assignment.submissions.length > 0 ? (
              <div className="space-y-4">
                {assignment.submissions.map((submissionItem) => {
                  const gradeState = gradeForms[submissionItem.id] ?? {
                    score: submissionItem.score !== null && submissionItem.score !== undefined ? String(submissionItem.score) : '',
                    feedback: submissionItem.feedback ?? '',
                    submitting: false,
                    error: null,
                    success: null,
                  }

                  return (
                    <div key={submissionItem.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{submissionItem.student_name}</p>
                          <p className="text-xs text-slate-500">Enviado el {formatDate(submissionItem.submitted_at)}</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {submissionItem.score != null ? `Calificado ${submissionItem.score}` : 'Sin calificar'}
                        </span>
                      </div>

                      {submissionItem.content && (
                        <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">
                          {submissionItem.content}
                        </div>
                      )}

                      {submissionItem.screenshot_url && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-sm font-semibold text-slate-900">Archivo entregado</p>
                          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <FileViewer
                              file={createSubmissionFileMetadata(submissionItem.screenshot_url, submissionItem.screenshot_path)}
                              height="460px"
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="text-sm font-semibold text-slate-900">Puntaje</label>
                          <input
                            type="number"
                            min="0"
                            value={gradeState.score}
                            onChange={(event) =>
                              updateGradeForm(submissionItem.id, { score: event.target.value })
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-900">Feedback</label>
                          <textarea
                            value={gradeState.feedback}
                            onChange={(event) =>
                              updateGradeForm(submissionItem.id, { feedback: event.target.value })
                            }
                            rows={4}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                        {gradeState.error && (
                          <p className="text-sm text-rose-600">{gradeState.error}</p>
                        )}
                        {gradeState.success && (
                          <p className="text-sm text-emerald-600">{gradeState.success}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => handleGradeSubmit(submissionItem.id)}
                          disabled={gradeState.submitting}
                          className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {gradeState.submitting ? 'Guardando...' : 'Guardar calificación'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                <p className="text-sm font-semibold text-slate-900">Aún no hay entregas</p>
                <p className="mt-2 text-sm">Las entregas aparecerán aquí cuando los estudiantes envíen su trabajo.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Información</h3>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {assignment.points !== null && assignment.points !== undefined && (
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-gray-600 text-xs">Puntos disponibles</p>
                  <p className="font-semibold text-slate-900">{assignment.points}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-gray-600 text-xs">Creada</p>
                <p className="font-medium text-slate-900">{formatDate(assignment.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
