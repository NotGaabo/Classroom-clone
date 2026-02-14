'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClassItem {
  id: string
  name: string
  description: string | null
  created_at: string
  class_members?: Array<{
    role: string
    profiles?: {
      full_name?: string
      email?: string
    }
  }>
}

export default function ClassroomDashboard() {
  const router = useRouter()

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [fetchingClasses, setFetchingClasses] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setFetchingClasses(true)
    try {
      const res = await fetch('/api/classes')
      if (!res.ok) throw new Error('Error al cargar las clases')
      const data = await res.json()
      setClasses(data)
    } catch (err) {
      console.error(err)
      alert('No se pudieron cargar las clases. Recarga la página.')
    } finally {
      setFetchingClasses(false)
    }
  }

  const deleteClass = async (classId: string, className: string) => {
    const ok = window.confirm(`¿Eliminar "${className}"? Esta acción no se puede deshacer.`)
    if (!ok) return

    try {
      const res = await fetch(`/api/classes/${classId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        alert(data.error || 'Error al eliminar la clase')
        return
      }

      setClasses(prev => prev.filter(c => c.id !== classId))
      alert('Clase eliminada')
    } catch (err) {
      console.error(err)
      alert('Error al eliminar la clase')
    }
  }

  const colors = [
    'from-slate-600 to-slate-700',
    'from-blue-600 to-blue-700',
    'from-sky-500 to-sky-600',
    'from-emerald-600 to-emerald-700',
    'from-orange-600 to-orange-700',
    'from-rose-600 to-rose-700',
    'from-purple-600 to-purple-700',
    'from-indigo-600 to-indigo-700',
    'from-pink-600 to-pink-700',
    'from-teal-600 to-teal-700'
  ]

  const getColorForClass = (classId: string) => {
    const index = parseInt(classId.replace(/\D/g, ''), 10) || 0
    return colors[index % colors.length]
  }

  const getTeacherInitials = (classItem: ClassItem) => {
    const teacher = classItem.class_members?.find(m => m.role === 'teacher')
    const full = teacher?.profiles?.full_name
    if (full) {
      const parts = full.trim().split(/\s+/)
      return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase()
    }
    return '👤'
  }

  const getTeacherName = (classItem: ClassItem) => {
    const teacher = classItem.class_members?.find(m => m.role === 'teacher')
    return teacher?.profiles?.full_name || teacher?.profiles?.email || 'Profesor'
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Clases</h1>
          <button
            onClick={fetchClasses}
            className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50"
            disabled={fetchingClasses}
          >
            {fetchingClasses ? 'Cargando...' : 'Recargar'}
          </button>
        </div>

        {fetchingClasses && classes.length === 0 ? (
          <div className="p-10 text-center text-gray-600">Cargando clases...</div>
        ) : classes.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No tienes clases aún.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                onClick={() => router.push(`/classes/${classItem.id}`)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className={`h-32 bg-gradient-to-br ${getColorForClass(classItem.id)} p-5 relative`}>
                  <h3 className="text-white font-semibold text-lg line-clamp-2 mb-1">
                    {classItem.name}
                  </h3>
                  <p className="text-white/90 text-sm line-clamp-1">
                    {classItem.description || 'Sin descripción'}
                  </p>

                  <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-semibold">
                    {getTeacherInitials(classItem)}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-1">{getTeacherName(classItem)}</p>
                  <p className="text-xs text-gray-400">Creado el {formatDate(classItem.created_at)}</p>
                </div>

                <div className="px-4 pb-4 border-t border-gray-100 pt-3 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteClass(classItem.id, classItem.name)
                    }}
                    className="p-2 rounded-full hover:bg-red-50"
                    title="Eliminar clase"
                  >
                    <svg className="w-5 h-5 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
