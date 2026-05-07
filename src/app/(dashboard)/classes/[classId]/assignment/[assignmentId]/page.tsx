'use client'

import { useParams } from 'next/navigation'
import { useAssignment } from '@/hooks/useAssignments'
import { useComments } from '@/hooks/useComments'
import AssignmentHeader from '@/components/assignments/AssignmentHeader'
import AssignmentCard from '@/components/assignments/AssignmentCard'
import AssignmentFilesSection from '@/components/assignments/AssignmentFilesSection'
import CommentsSection from '@/components/assignments/CommentsSection'
import Sidebar from '@/components/assignments/Sidebar'

export default function AssignmentDetailPage() {
  const params = useParams()
  const assignmentId = params.assignmentId as string

  const { assignment, loading, error, isOnline, refresh } = useAssignment(assignmentId)
  const commentsData = useComments(assignmentId)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="font-medium text-slate-700">Cargando asignación...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-rose-200 border-l-4 border-l-rose-500 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
                <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-slate-900">Error al cargar</h3>
                <p className="text-sm text-slate-600">
                  {error || 'Asignación no encontrada'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 20% -20%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(14,165,233,0.06) 0%, transparent 60%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AssignmentHeader isOnline={isOnline} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <AssignmentCard assignment={assignment} />
            <AssignmentFilesSection assignmentId={assignmentId} files={assignment.files ?? []} />
            <CommentsSection {...commentsData} />
          </div>

          <Sidebar assignment={assignment} onRefresh={refresh} />
        </div>
      </div>
    </div>
  )
}
