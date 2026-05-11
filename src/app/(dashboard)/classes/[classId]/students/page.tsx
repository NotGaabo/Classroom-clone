'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface ClassMember {
  role: string
  user_id: string
  profiles?: {
    full_name?: string | null
    email?: string | null
  }
}

interface ClassDetails {
  id: string
  name: string
  description?: string | null
  created_at: string
  class_members?: ClassMember[]
}

export default function StudentsPage() {
  const params = useParams()
  const classId = params.classId as string
  const [classInfo, setClassInfo] = useState<ClassDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!classId) return

    const fetchClass = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/classes/${classId}`)
        if (!res.ok) throw new Error('No se pudo cargar la clase')
        const payload = await res.json()
        setClassInfo(payload.data)
        setError(null)
      } catch (fetchError) {
        console.error(fetchError)
        setError((fetchError as Error).message || 'Error al cargar los integrantes')
      } finally {
        setLoading(false)
      }
    }

    fetchClass()
  }, [classId])

  const formatName = (member: ClassMember) => member.profiles?.full_name || member.profiles?.email || 'Usuario'
  const students = classInfo?.class_members?.filter((member) => member.role !== 'teacher') ?? []
  const teacher = classInfo?.class_members?.find((member) => member.role === 'teacher')

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Personas
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Equipo de clase</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
            {classInfo
              ? `Consulta el profesorado y los estudiantes registrados en ${classInfo.name}.`
              : 'Carga la información del grupo para ver todos sus integrantes.'}
          </p>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white/90 px-6 py-20 text-center text-slate-500">
            Cargando integrantes...
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-rose-200 bg-white p-6 text-rose-600 shadow-sm">{error}</div>
        ) : !classInfo ? (
          <div className="rounded-[24px] border border-slate-200 bg-white/90 px-6 py-20 text-center text-slate-500">
            Clase no encontrada
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#0ea5e9)] font-semibold text-white shadow-[0_10px_18px_rgba(37,99,235,0.28)]">
                PR
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {formatName(teacher ?? { role: 'teacher', user_id: '', profiles: { full_name: 'Profesor' } })}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Profesor</p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Encargado de la clase, publicación de asignaciones y coordinación del grupo.
              </p>
            </article>

            {students.length === 0 ? (
              <article className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                <p className="text-lg font-semibold text-slate-900">Aún no hay estudiantes</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Los alumnos aparecerán aquí cuando se unan con el código de clase.
                </p>
              </article>
            ) : (
              students.map((member) => {
                const name = formatName(member)
                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()

                return (
                  <article key={member.user_id} className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 font-semibold text-white shadow-sm">
                      {initials || 'AL'}
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Alumno</p>
                    <p className="mt-4 text-sm leading-6 text-slate-500">ID del usuario: {member.user_id}</p>
                  </article>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
