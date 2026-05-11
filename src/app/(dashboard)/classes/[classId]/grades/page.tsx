'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatDate } from '@/utils/dateFormat'

interface ClassDetails {
  id: string
  name: string
  description?: string | null
  created_at: string
}

interface AssignmentSummary {
  id: string
  title: string
  description: string | null
  points: number | null
  due_date: string | null
  created_at: string
  score?: number | null
}

export default function GradesPage() {
  const params = useParams()
  const classId = params.classId as string
  const [classInfo, setClassInfo] = useState<ClassDetails | null>(null)
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!classId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [classRes, assignmentsRes] = await Promise.all([
          fetch(`/api/classes/${classId}`),
          fetch(`/api/assignments?class_id=${classId}`),
        ])

        if (!classRes.ok) throw new Error('No se pudo cargar la clase')
        if (!assignmentsRes.ok) throw new Error('No se pudieron cargar las asignaciones')

        const classPayload = await classRes.json()
        const assignmentsPayload = await assignmentsRes.json()

        setClassInfo(classPayload.data)
        setAssignments(assignmentsPayload.data ?? [])
        setError(null)
      } catch (fetchError) {
        console.error(fetchError)
        setError((fetchError as Error).message || 'Error al cargar las calificaciones')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [classId])

  const averagePoints = assignments.filter((item) => typeof item.points === 'number')
  const totalPoints = averagePoints.reduce((sum, item) => sum + (item.points ?? 0), 0)

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Calificaciones
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Resumen de notas</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
            {classInfo
              ? `Mira el estado general de las tareas publicadas en ${classInfo.name}, sus puntos y fechas límite.`
              : 'Carga primero la información de la clase para mostrar el resumen.'}
          </p>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white/90 px-6 py-20 text-center text-slate-500">
            Cargando calificaciones...
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-rose-200 bg-white p-6 text-rose-600 shadow-sm">{error}</div>
        ) : assignments.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-white/90 px-6 py-20 text-center">
            <p className="text-lg font-semibold text-slate-900">Aún no hay asignaciones</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Las calificaciones aparecerán aquí cuando el profesor publique tareas con puntaje.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tareas</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{assignments.length}</p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Puntos totales</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{totalPoints}</p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Evaluadas</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {assignments.filter((item) => item.score !== null && item.score !== undefined).length}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((assignment) => (
                <article key={assignment.id} className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{assignment.title}</h2>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        {assignment.due_date ? formatDate(assignment.due_date) : 'Sin fecha límite'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-blue-700">Puntaje</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {assignment.score !== null && assignment.score !== undefined
                          ? `${assignment.score} / ${assignment.points ?? '—'}`
                          : `— / ${assignment.points ?? '—'}`}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-500">
                    {assignment.description || 'Sin descripción adicional.'}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
