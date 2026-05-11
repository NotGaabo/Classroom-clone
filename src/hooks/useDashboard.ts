import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useClassList } from '@/features/classes/hooks/useClassList'

export function useDashboard() {

  const router = useRouter()
  const {
    classes,
    deleteClass,
    fetchClasses,
    fetchingClasses,
    formatDate,
    getTeacherInitials,
    getTeacherName,
  } = useClassList()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const cardPalettes = [
    { from: '#312e81', to: '#4338ca', accent: '#6366f1' },    // Índigo profundo
    { from: '#164e63', to: '#0e7490', accent: '#06b6d4' },    // Cian oscuro
    { from: '#065f46', to: '#047857', accent: '#10b981' },    // Esmeralda
    { from: '#1e1b4b', to: '#3730a3', accent: '#818cf8' },    // Violeta
    { from: '#0c4a6e', to: '#0369a1', accent: '#38bdf8' },    // Azul cielo
    { from: '#134e4a', to: '#0f766e', accent: '#2dd4bf' },    // Teal
    { from: '#1e3a5f', to: '#1d4ed8', accent: '#60a5fa' },    // Azul real
    { from: '#3b0764', to: '#6d28d9', accent: '#a78bfa' },    // Púrpura
  ]

  const getPaletteForClass = (classId: string) => {
    const index = parseInt(classId.replace(/\D/g, ''), 10) || 0
    return cardPalettes[index % cardPalettes.length]
  }

  const averageProgress = useMemo(() => {
    const studentClasses = classes.filter((classItem) => classItem.my_role === 'student' && classItem.progress != null)

    if (studentClasses.length === 0) {
      return null
    }

    return Math.round(
      studentClasses.reduce((sum, classItem) => sum + (classItem.progress ?? 0), 0) / studentClasses.length
    )
  }, [classes])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const createClass = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      const payload = await res.json()
      if (!res.ok) { alert(payload.error?.message || 'Error al crear la clase'); return }
      await fetchClasses()
      setName(''); setDescription(''); setShowCreateModal(false)
    } catch { alert('Error al crear la clase') }
    finally { setLoading(false) }
  }

  const joinClass = async () => {
    if (!joinCode.trim()) return
    setJoinLoading(true)
    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() })
      })
      const payload = await res.json()
      if (!res.ok) { alert(payload.error?.message || 'Código inválido'); return }
      await fetchClasses()
      setJoinCode(''); setShowJoinModal(false)
    } catch { alert('Error al unirse a la clase') }
    finally { setJoinLoading(false) }
  }

  const goToClass = (classId: string) => router.push(`/classes/${classId}`)

  return {
    goToClass,
    deleteClass,
    getTeacherInitials,
    getTeacherName,
    getPaletteForClass,
    dropdownRef,
    createClass,
    joinClass,
    classes,
    showCreateModal,
    setShowCreateModal,
    showJoinModal,
    setShowJoinModal,
    showDropdown,
    setShowDropdown,
    showSidebar,
    setShowSidebar,
    name,
    setName,
    description,
    setDescription,
    joinCode,
    setJoinCode,
    loading,
    joinLoading,
    fetchingClasses,
    formatDate,
    averageProgress,
  }

}
