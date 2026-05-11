'use client'

import { AssignmentBoardHero } from '@/features/assignments/components/AssignmentBoardHero'
import { AssignmentCreationPanel } from '@/features/assignments/components/AssignmentCreationPanel'
import { AssignmentsFeed } from '@/features/assignments/components/AssignmentsFeed'
import { useAssignmentBoardPage } from '@/features/assignments/hooks/useAssignmentBoardPage'

export default function AssignmentsListPage() {
  const {
    assignments,
    classId,
    classInfo,
    createAssignment,
    dateError,
    description,
    dueDate,
    dueTime,
    error,
    fetchAssignments,
    formatDate,
    hasInvalidDueDate,
    isOverdue,
    loading,
    minDueDate,
    minDueTime,
    points,
    role,
    roleLoading,
    router,
    setDateError,
    setDescription,
    setDueDate,
    setDueTime,
    setPoints,
    setTitle,
    submittedCount,
    submitting,
    title,
  } = useAssignmentBoardPage()

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <AssignmentBoardHero
          classCode={classInfo?.code}
          className={classInfo?.name}
          submittedCount={submittedCount}
          totalAssignments={assignments.length}
        />

        {!roleLoading && role === 'teacher' && (
          <AssignmentCreationPanel
            dateError={dateError}
            description={description}
            dueDate={dueDate}
            dueTime={dueTime}
            hasInvalidDueDate={hasInvalidDueDate}
            minDueDate={minDueDate}
            minDueTime={minDueTime}
            points={points}
            setDateError={setDateError}
            setDescription={setDescription}
            setDueDate={setDueDate}
            setDueTime={setDueTime}
            setPoints={setPoints}
            setTitle={setTitle}
            submitting={submitting}
            title={title}
            onCreateAssignment={createAssignment}
          />
        )}

        <AssignmentsFeed
          assignments={assignments}
          error={error}
          fetchAssignments={fetchAssignments}
          formatDate={formatDate}
          isOverdue={isOverdue}
          loading={loading}
          role={role}
          onOpenAssignment={(assignmentId) => router.push(`/classes/${classId}/assignment/${assignmentId}`)}
        />
      </div>
    </div>
  )
}
