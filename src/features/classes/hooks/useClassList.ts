'use client'

import { useCallback, useMemo, useState } from 'react'

export interface ClassListItem {
  class_members?: Array<{
    enrollment_state?: string | null
    profiles?: {
      email?: string | null
      full_name?: string | null
    }
    role: string
    user_id?: string
  }>
  code?: string | null
  created_at: string
  description: string | null
  id: string
  my_role?: string | null
  name: string
  progress?: number | null
}

function getTeacher(classItem: ClassListItem) {
  return classItem.class_members?.find((member) => member.role === 'teacher')
}

export function useClassList() {
  const [classes, setClasses] = useState<ClassListItem[]>([])
  const [fetchingClasses, setFetchingClasses] = useState(true)

  const fetchClasses = useCallback(async () => {
    setFetchingClasses(true)

    try {
      const response = await fetch('/api/classes')
      const payload = (await response.json()) as {
        data?: ClassListItem[]
        error?: { message?: string }
      }

      if (!response.ok) {
        throw new Error(payload.error?.message || 'No se pudieron cargar las clases')
      }

      setClasses(payload.data ?? [])
    } catch (error) {
      console.error(error)
      alert('No se pudieron cargar las clases. Recarga la página.')
    } finally {
      setFetchingClasses(false)
    }
  }, [])

  const deleteClass = useCallback(async (classId: string, className: string) => {
    const ok = window.confirm(`¿Eliminar "${className}"? Esta acción no se puede deshacer.`)
    if (!ok) return

    try {
      const response = await fetch(`/api/classes/${classId}`, { method: 'DELETE' })
      const payload = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null

      if (!response.ok) {
        alert(payload?.error?.message || 'Error al eliminar la clase')
        return
      }

      setClasses((previous) => previous.filter((classItem) => classItem.id !== classId))
      alert('Clase eliminada')
    } catch (error) {
      console.error(error)
      alert('Error al eliminar la clase')
    }
  }, [])

  const helpers = useMemo(
    () => ({
      formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      },
      getTeacherInitials(classItem: ClassListItem) {
        const teacher = getTeacher(classItem)
        const full = teacher?.profiles?.full_name

        if (!full) {
          return 'PR'
        }

        return full
          .trim()
          .split(/\s+/)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      },
      getTeacherName(classItem: ClassListItem) {
        const teacher = getTeacher(classItem)
        return teacher?.profiles?.full_name || teacher?.profiles?.email || 'Profesor'
      },
    }),
    []
  )

  return {
    classes,
    deleteClass,
    fetchClasses,
    fetchingClasses,
    ...helpers,
  }
}
