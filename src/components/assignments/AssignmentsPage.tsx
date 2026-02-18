'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AssignmentPage } from '@/types/assignments'


export default function AssignmentsPage() {
    const params = useParams()
    const class_id = params.classId as string

    const [assignments, setAssignments] = useState<AssignmentPage[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
  
  // Cargar las clases al montar el componente
  useEffect(() => {
      if (class_id) {
        fetchAssignments()
      }
    }, [class_id]
  )

  const fetchAssignments = async () => {
    setFetching(true)
    try {
      const res = await fetch(`/api/assignments?class_id=${class_id}`)
      
      if (!res.ok) {
        throw new Error('Error al cargar las asignaciones')
      }

      const data = await res.json()
      setAssignments(data)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      alert('No se pudieron cargar las asignaciones. Por favor recarga la página.')
    } finally {
      setFetching(false)
    }
  }

  const createAssignments = async () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la clase')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ class_id: class_id, title: name, description, due_date: dueDate })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al crear la asignación')
        return
      }

      await fetchAssignments()

      setName('')
      setDescription('')
      setDueDate('')
      
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear la asignación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-gray-700">
      <h2 className="text-xl font-semibold mb-6">Trabajo de clase</h2>

      {/* Crear asignación */}
      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Título"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <button
          onClick={createAssignments}
          disabled={loading || !name.trim()}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear asignación'}
        </button>
      </div>

      {/* Lista */}
      {fetching ? (
        <p>Cargando asignaciones...</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-500">No hay asignaciones aún.</p>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg">
                {assignment.title}
              </h3>

              {assignment.description && (
                <p className="text-gray-600 mt-2">
                  {assignment.description}
                </p>
              )}

              {assignment.due_date && (
                <p className="text-sm text-gray-500 mt-2">
                  Fecha límite: {assignment.due_date}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}