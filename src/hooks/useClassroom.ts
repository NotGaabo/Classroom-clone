import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClassList } from '@/features/classes/hooks/useClassList'

export function useClassroom() {
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

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

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

  return {
    classes,
    router,
    fetchingClasses,
    getColorForClass,
    getTeacherInitials,
    getTeacherName,
    formatDate,
    deleteClass,
    fetchClasses,
  }
}
