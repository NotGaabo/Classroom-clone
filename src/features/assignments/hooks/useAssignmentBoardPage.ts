'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAssignmentsList } from '@/hooks/useAssignmentsList'

const padDatePart = (value: number) => value.toString().padStart(2, '0')

const formatDateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  return `${year}-${month}-${day}`
}

const formatTimeInputValue = (date: Date) => {
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())
  return `${hours}:${minutes}`
}

export function useAssignmentBoardPage() {
  const assignmentsList = useAssignmentsList()
  const { assignments, classId, fetchAssignments } = assignmentsList

  const [classInfo, setClassInfo] = useState<{ name: string; code?: string | null } | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [points, setPoints] = useState<number | ''>(100)
  const [submitting, setSubmitting] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)

  const now = new Date()
  const minDueDate = formatDateInputValue(now)
  const minDueTime = dueDate === minDueDate ? formatTimeInputValue(now) : ''

  useEffect(() => {
    if (!classId) return

    const fetchClassInfo = async () => {
      try {
        const res = await fetch(`/api/classes/${classId}`)
        if (!res.ok) return

        const payload = (await res.json().catch(() => null)) as
          | { data?: { code?: string | null; name?: string | null } }
          | null

        setClassInfo({
          name: payload?.data?.name || 'Centro de asignaciones',
          code: payload?.data?.code ?? null,
        })
      } catch (fetchError) {
        console.error(fetchError)
      }
    }

    fetchClassInfo()
  }, [classId])

  const buildDueDateValue = useCallback(() => {
    if (!dueDate) return null
    return dueTime ? `${dueDate}T${dueTime}` : `${dueDate}T23:59`
  }, [dueDate, dueTime])

  const validateDueDate = useCallback(() => {
    if (!dueDate) {
      setDateError(null)
      return true
    }

    if (dueDate < minDueDate) {
      setDateError('La fecha de entrega no puede ser anterior a hoy.')
      return false
    }

    if (dueDate === minDueDate && dueTime && dueTime < minDueTime) {
      setDateError('La hora de entrega para hoy debe ser actual o futura.')
      return false
    }

    setDateError(null)
    return true
  }, [dueDate, dueTime, minDueDate, minDueTime])

  const hasInvalidDueDate = useMemo(
    () =>
      !!dueDate &&
      (dueDate < minDueDate || (dueDate === minDueDate && !!dueTime && dueTime < minDueTime)),
    [dueDate, dueTime, minDueDate, minDueTime]
  )

  const createAssignment = useCallback(async () => {
    if (!title.trim() || !classId) return
    if (!validateDueDate()) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classId,
          title: title.trim(),
          description: description.trim() || null,
          due_date: buildDueDateValue(),
          points: typeof points === 'number' ? points : null,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        alert(data?.error?.message || 'No se pudo crear la asignación')
        return
      }

      setTitle('')
      setDescription('')
      setDueDate('')
      setDueTime('')
      setPoints(100)
      setDateError(null)
      await fetchAssignments()
    } catch (createError) {
      console.error(createError)
      alert('No se pudo crear la asignación')
    } finally {
      setSubmitting(false)
    }
  }, [buildDueDateValue, classId, description, fetchAssignments, points, title, validateDueDate])

  const submittedCount = useMemo(
    () => assignments.filter((assignment) => assignment.status === 'submitted').length,
    [assignments]
  )

  return {
    ...assignmentsList,
    classInfo,
    createAssignment,
    dateError,
    description,
    dueDate,
    dueTime,
    hasInvalidDueDate,
    minDueDate,
    minDueTime,
    points,
    setDateError,
    setDescription,
    setDueDate,
    setDueTime,
    setPoints,
    setTitle,
    submittedCount,
    submitting,
    title,
  }
}
