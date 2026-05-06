'use client'

import { useMemo, useState } from 'react'
import { useAssignmentsList } from '@/hooks/useAssignmentsList'
import { formatDate, parseDateString } from '@/utils/dateFormat'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const pad = (value: number) => String(value).padStart(2, '0')
const getDayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export default function ClassCalendarPage() {
  const { assignments, classId, router, loading, error, isOverdue } = useAssignmentsList()
  const today = useMemo(() => new Date(), [])
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDay, setSelectedDay] = useState(getDayKey(today))

  const assignmentsByDay = useMemo(() => {
    const map = new Map<string, typeof assignments>()

    assignments.forEach((assignment) => {
      if (!assignment.due_date) return
      const dueDate = parseDateString(assignment.due_date)
      const key = getDayKey(dueDate)
      const list = map.get(key) ?? []
      map.set(key, [...list, assignment])
    })

    return map
  }, [assignments])

  const monthCells = useMemo(() => {
    const firstDay = new Date(current.year, current.month, 1).getDay()
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
    const daysInPrev = new Date(current.year, current.month, 0).getDate()
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

    return Array.from({ length: totalCells }, (_, index) => {
      let day: number
      let month = current.month
      let year = current.year
      let other = false

      if (index < firstDay) {
        day = daysInPrev - firstDay + index + 1
        month = current.month === 0 ? 11 : current.month - 1
        year = current.month === 0 ? current.year - 1 : current.year
        other = true
      } else if (index >= firstDay + daysInMonth) {
        day = index - firstDay - daysInMonth + 1
        month = current.month === 11 ? 0 : current.month + 1
        year = current.month === 11 ? current.year + 1 : current.year
        other = true
      } else {
        day = index - firstDay + 1
      }

      const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`
      const cellDate = new Date(year, month, day)
      const isToday = getDayKey(cellDate) === getDayKey(today)
      const dueList = assignmentsByDay.get(dateKey) ?? []

      return { day, dateKey, other, isToday, assignments: dueList }
    })
  }, [assignmentsByDay, current, today])

  const selectedAssignments = assignmentsByDay.get(selectedDay) ?? []
  const selectedDateLabel = formatDate(selectedDay)

  const prevMonth = () => {
    setCurrent((prev) => {
      const month = prev.month === 0 ? 11 : prev.month - 1
      return { year: prev.month === 0 ? prev.year - 1 : prev.year, month }
    })
  }

  const nextMonth = () => {
    setCurrent((prev) => {
      const month = prev.month === 11 ? 0 : prev.month + 1
      return { year: prev.month === 11 ? prev.year + 1 : prev.year, month }
    })
  }

  const goToday = () => {
    setCurrent({ year: today.getFullYear(), month: today.getMonth() })
    setSelectedDay(getDayKey(today))
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Calendario
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Calendario de entregas</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
              Revisa qué días tienen tareas programadas y abre la asignación correspondiente directamente desde el calendario.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={prevMonth} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">‹ Mes anterior</button>
            <button onClick={goToday} className="rounded-full bg-[linear-gradient(135deg,#2563eb,#0284c7)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]">Hoy</button>
            <button onClick={nextMonth} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Mes siguiente ›</button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-6">
              <p className="text-lg font-semibold text-slate-900">{MONTHS[current.month]} {current.year}</p>
              <p className="mt-1 text-sm text-slate-500">Selecciona un día para ver las tareas pendientes o próximas.</p>
            </div>

            <div className="grid grid-cols-7 overflow-hidden rounded-[22px] border border-slate-200">
              {DAYS.map((day) => (
                <div key={day} className="border-b border-slate-200 bg-slate-50 px-2 py-3 text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {day}
                </div>
              ))}

              {monthCells.map((cell) => (
                <button
                  key={`${cell.dateKey}-${cell.day}`}
                  className={`min-h-[112px] border-b border-r border-slate-200 px-3 py-3 text-left transition ${cell.other ? 'bg-slate-50 text-slate-400' : 'bg-white hover:bg-blue-50/60'} ${cell.dateKey === selectedDay ? 'bg-blue-50/80' : ''}`}
                  onClick={() => setSelectedDay(cell.dateKey)}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${cell.isToday ? 'bg-blue-600 text-white' : 'text-slate-900'}`}>
                    {cell.day}
                  </div>
                  {cell.assignments.length > 0 && (
                    <span className="mt-4 inline-flex max-w-full truncate rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[0.68rem] font-semibold text-blue-700">
                      {cell.assignments[0].title}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-xl font-semibold text-slate-900">Entregas para {selectedDateLabel}</h2>

            <div className="mt-5">
              {loading ? (
                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                  Cargando tareas...
                </div>
              ) : error ? (
                <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-8 text-sm text-rose-600">
                  No se pudieron cargar las tareas.
                </div>
              ) : selectedAssignments.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                  No hay tareas programadas para esta fecha.
                </div>
              ) : (
                <div className="grid gap-3">
                  {selectedAssignments.map((assignment) => (
                    <article
                      key={assignment.id}
                      className="cursor-pointer rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200"
                      onClick={() => router.push(`/classes/${classId}/assignment/${assignment.id}`)}
                    >
                      <h3 className="text-base font-semibold text-slate-900">{assignment.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {assignment.description || 'Sin descripción.'}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        {assignment.points !== null && assignment.points !== undefined && (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                            {assignment.points} pts
                          </span>
                        )}
                        {assignment.due_date && isOverdue(assignment.due_date) && (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-600">
                            vencida
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
