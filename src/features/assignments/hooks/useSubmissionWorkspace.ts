'use client'

import { useEffect, useMemo, useState } from 'react'
import { Assignment } from '@/types/assignments'

type DraftMap = Record<string, { score: string; feedback: string }>

interface UseSubmissionWorkspaceOptions {
  assignment: Assignment
  onRefresh: () => Promise<void>
}

export function useSubmissionWorkspace({ assignment, onRefresh }: UseSubmissionWorkspaceOptions) {
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

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((previous) => previous.filter((_, currentIndex) => currentIndex !== index))
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
          text: data?.error?.message || data?.error || 'No se pudo guardar la entrega',
        })
        return
      }

      setSelectedFiles([])
      setMessage({
        type: 'success',
        text: data?.data?.replaced_files
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

  const handleGradeSubmission = async (submissionId: string, studentName: string) => {
    const draft = drafts[submissionId] ?? { score: '', feedback: '' }
    setGrading((previous) => ({ ...previous, [submissionId]: true }))

    try {
      const response = await fetch(`/api/assignments/${assignment.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          score: draft.score,
          feedback: draft.feedback,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data?.error?.message || data?.error || `No se pudo calificar a ${studentName}`,
        })
        return
      }

      setMessage({
        type: 'success',
        text: `Calificación guardada para ${studentName}.`,
      })
      await onRefresh()
    } catch {
      setMessage({
        type: 'error',
        text: `No se pudo guardar la calificación de ${studentName}.`,
      })
    } finally {
      setGrading((previous) => ({ ...previous, [submissionId]: false }))
    }
  }

  return {
    canSubmitStudentWork,
    currentFiles,
    currentSubmission,
    drafts,
    grading,
    handleGradeChange,
    handleGradeSubmission,
    handleRemoveSelectedFile,
    handleStudentFiles,
    handleSubmitStudentWork,
    message,
    saving,
    selectedFiles,
    setSubmissionText,
    studentHeaderLabel,
    submissionCount,
    submissionText,
    sortedSubmissions,
  }
}
