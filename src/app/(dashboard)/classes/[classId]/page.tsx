'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type ClassDetail = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function ClassStreamPage() {
  const { classId } = useParams<{ classId: string }>()
  const [cls, setCls] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/classes/${classId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error')
        setCls(data)
      } catch (e) {
        console.error(e)
        setCls(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [classId])

  if (loading) return <div className="text-gray-600">Cargando...</div>
  if (!cls) return <div className="text-gray-600">No encontrada o sin permiso.</div>

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{cls.name}</h2>
      <p className="text-gray-600 mb-6">{cls.description || 'Sin descripción'}</p>

      <div className="bg-gray-50 border rounded-xl p-4 text-gray-700">
        Aquí va el tablón (anuncios, posts, etc).
      </div>
    </div>
  )
}
