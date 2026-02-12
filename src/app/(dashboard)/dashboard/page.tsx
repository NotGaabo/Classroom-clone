'use client'

import { useState, useEffect } from 'react'

// Tipos para las clases
interface Class {
  id: string
  name: string
  description: string
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
  const [classes, setClasses] = useState<Class[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingClasses, setFetchingClasses] = useState(true)

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

  // Función para obtener un color basado en el ID de la clase
  const getColorForClass = (classId: string) => {
    const index = parseInt(classId.replace(/\D/g, ''), 10) || 0
    return colors[index % colors.length]
  }

  // Función para obtener las iniciales del profesor
  const getTeacherInitials = (classItem: Class) => {
    const teacher = classItem.class_members?.find(m => m.role === 'teacher')
    if (teacher?.profiles?.full_name) {
      const names = teacher.profiles.full_name.split(' ')
      return names.map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    return '👤'
  }

  // Función para obtener el nombre del profesor
  const getTeacherName = (classItem: Class) => {
    const teacher = classItem.class_members?.find(m => m.role === 'teacher')
    return teacher?.profiles?.full_name || teacher?.profiles?.email || 'Profesor'
  }

  // Cargar las clases al montar el componente
  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setFetchingClasses(true)
    try {
      const res = await fetch('/api/classes')
      
      if (!res.ok) {
        throw new Error('Error al cargar las clases')
      }

      const data = await res.json()
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
      // Mostrar mensaje de error al usuario
      alert('No se pudieron cargar las clases. Por favor recarga la página.')
    } finally {
      setFetchingClasses(false)
    }
  }

  const createClass = async () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la clase')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al crear la clase')
        return
      }

      // Recargar todas las clases para obtener los datos completos
      await fetchClasses()

      // Limpiar y cerrar modal
      setName('')
      setDescription('')
      setShowCreateModal(false)
      
      // Mostrar mensaje de éxito
      alert('¡Clase creada exitosamente! 🔥')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear la clase')
    } finally {
      setLoading(false)
    }
  }

  const deleteClass = async (classId: string, className: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la clase "${className}"? Esta acción no se puede deshacer.`
    )

    if (!confirmDelete) return

    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error al eliminar la clase')
        return
      }

      // Remover la clase del estado local
      setClasses(classes.filter(c => c.id !== classId))
      alert('Clase eliminada exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar la clase')
    }
  }

  // Formato de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-medium text-gray-800">Classroom</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Crear clase"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button 
              onClick={fetchClasses}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Recargar clases"
              disabled={fetchingClasses}
            >
              <svg 
                className={`w-6 h-6 ${fetchingClasses ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full ml-2"></div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendario
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Clases
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-[1400px] mx-auto">
            {/* Loading state */}
            {fetchingClasses && classes.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600">Cargando clases...</p>
                </div>
              </div>
            ) : classes.length === 0 ? (
              // Empty state
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No tienes clases aún</h3>
                  <p className="text-gray-600 mb-4">Crea tu primera clase para comenzar</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Crear mi primera clase
                  </button>
                </div>
              </div>
            ) : (
              // Classes grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classes.map((classItem) => (
                  <div 
                    key={classItem.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                  >
                    {/* Card Header con gradiente */}
                    <div className={`h-32 bg-gradient-to-br ${getColorForClass(classItem.id)} p-5 relative overflow-hidden`}>
                      {/* Patrón decorativo */}
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="40" fill="white" />
                        </svg>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-white font-semibold text-lg line-clamp-2 mb-1">
                          {classItem.name}
                        </h3>
                        <p className="text-white/90 text-sm line-clamp-1">
                          {classItem.description || 'Sin descripción'}
                        </p>
                      </div>
                      {/* Avatar del profesor */}
                      <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden">
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                          {getTeacherInitials(classItem)}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-1">{getTeacherName(classItem)}</p>
                      <p className="text-xs text-gray-400">Creado el {formatDate(classItem.created_at)}</p>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteClass(classItem.id, classItem.name)
                        }}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors group/delete"
                      >
                        <svg className="w-5 h-5 text-gray-600 group-hover/delete:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Card para crear nueva clase */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-dashed border-gray-300 hover:border-blue-400 h-[280px] flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-gray-600 group-hover:text-blue-600 font-medium transition-colors">
                    Crear nueva clase
                  </span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal para crear clase */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Crear clase</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la clase *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Matemáticas 2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Curso de matemáticas avanzadas"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={createClass}
                disabled={loading || !name.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  'Crear clase'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}