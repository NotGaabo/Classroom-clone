'use client'

import { useEffect, useState } from 'react'
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

export default function AssignmentsListPage() {
  const {
    assignments,
    classId,
    router,
    loading,
    error,
    fetchAssignments,
    formatDate,
    isOverdue,
    role,
    roleLoading,
  } = useAssignmentsList()

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
        const data = await res.json()
        setClassInfo({
          name: data.name,
          code: data.code ?? null,
        })
      } catch (fetchError) {
        console.error(fetchError)
      }
    }

    fetchClassInfo()
  }, [classId])

  const buildDueDateValue = () => {
    if (!dueDate) return null
    return dueTime ? `${dueDate}T${dueTime}` : `${dueDate}T23:59`
  }

  const validateDueDate = () => {
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
  }

  const hasInvalidDueDate =
    !!dueDate &&
    (dueDate < minDueDate || (dueDate === minDueDate && !!dueTime && dueTime < minDueTime))

  const createAssignment = async () => {
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
        alert(data?.error || 'No se pudo crear la asignación')
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
  }

  const submittedCount = assignments.filter((assignment) => assignment.status === 'submitted').length

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_58%,#0ea5e9_100%)] px-6 py-8 text-white sm:px-8">
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.5) 0, transparent 28%), radial-gradient(circle at 80% 0, rgba(255,255,255,.35) 0, transparent 26%)" }} />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                  <span className="h-2 w-2 rounded-full bg-sky-300" />
                  Trabajo de clase
                </div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {classInfo?.name || 'Centro de asignaciones'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-[0.95rem]">
                  Organiza tareas, fechas de entrega y seguimiento del grupo con una vista limpia inspirada en el módulo de clases de referencia.
                </p>
                {classInfo?.code && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-200">
                      Código
                    </span>
                    <span className="font-mono text-sm font-semibold tracking-[0.24em] text-white">
                      {classInfo.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(classInfo.code ?? '')}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                      title="Copiar código"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 10h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-200">Asignaciones</p>
                  <p className="mt-2 text-3xl font-semibold">{assignments.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-200">Entregadas</p>
                  <p className="mt-2 text-3xl font-semibold">{submittedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!roleLoading && role === 'teacher' && (
          <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profesor</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Publicar una nueva tarea</h2>
              </div>
              <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Visible para la clase
              </div>
            </div>

            <div className="grid gap-4">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                type="text"
                placeholder="Título de la asignación"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Descripción, instrucciones o criterios de entrega"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  type="date"
                  min={minDueDate}
                  value={dueDate}
                  onChange={(event) => {
                    const nextDate = event.target.value
                    setDueDate(nextDate)
                    if (nextDate !== minDueDate) {
                      setDateError(null)
                      return
                    }
                    if (dueTime && dueTime < minDueTime) {
                      setDueTime('')
                    }
                    setDateError(null)
                  }}
                />

                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  type="time"
                  min={dueDate === minDueDate ? minDueTime : undefined}
                  value={dueTime}
                  onChange={(event) => {
                    const nextTime = event.target.value
                    setDueTime(nextTime)
                    if (dueDate === minDueDate && nextTime && nextTime < minDueTime) {
                      setDateError('La hora de entrega para hoy debe ser actual o futura.')
                      return
                    }
                    setDateError(null)
                  }}
                  disabled={!dueDate}
                />

                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  type="number"
                  min="0"
                  step="1"
                  value={points}
                  onChange={(event) => {
                    const value = event.target.value
                    setPoints(value === '' ? '' : Math.max(0, Number.parseInt(value, 10) || 0))
                  }}
                  placeholder="Puntos"
                />
              </div>

              {dateError && (
                <p className="text-sm font-medium text-rose-600">{dateError}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Puedes dejar la fecha vacía si la tarea no tiene vencimiento.
                </p>
                <button
                  onClick={createAssignment}
                  disabled={submitting || !title.trim() || hasInvalidDueDate}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563eb,#0284c7)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {submitting ? 'Publicando...' : 'Publicar asignación'}
                </button>
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-[24px] border border-slate-200 bg-white/90">
            <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
            <p className="text-sm text-slate-500">Cargando asignaciones...</p>
          </div>
        ) : error ? (
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
        ) : assignments.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white/75 px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-blue-600" style={{ width: 72, height: 72 }}>
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
        ) : (
          <div className="grid gap-3">
            {assignments.map((assignment, index) => (
              <article
                key={assignment.id}
                onClick={() => router.push(`/classes/${classId}/assignment/${assignment.id}`)}
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
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
