'use client'

import { Assignment } from '@/types/assignments'
import { StudentSubmissionPanel } from '@/features/assignments/components/StudentSubmissionPanel'
import { TeacherSubmissionsPanel } from '@/features/assignments/components/TeacherSubmissionsPanel'
import { useSubmissionWorkspace } from '@/features/assignments/hooks/useSubmissionWorkspace'

interface Props {
  assignment: Assignment
  onRefresh: () => Promise<void>
}

export default function SubmissionWorkspace({ assignment, onRefresh }: Props) {
  const {
    canSubmitStudentWork,
    currentFiles,
    currentSubmission,
    drafts,
    grading,
    handleGradeChange,
    handleGradeSubmission,
    handleRemoveSelectedFile,
    handleStudentFiles,
    handleSubmitStudentWork,
    message,
    saving,
    selectedFiles,
    setSubmissionText,
    studentHeaderLabel,
    submissionCount,
    submissionText,
    sortedSubmissions,
  } = useSubmissionWorkspace({ assignment, onRefresh })

  if (assignment.my_role === 'teacher') {
    return (
      <TeacherSubmissionsPanel
        assignment={assignment}
        drafts={drafts}
        grading={grading}
        message={message}
        sortedSubmissions={sortedSubmissions}
        submissionCount={submissionCount}
        onGradeChange={handleGradeChange}
        onGradeSubmission={handleGradeSubmission}
      />
    )
  }

  return (
    <StudentSubmissionPanel
      canSubmitStudentWork={canSubmitStudentWork}
      currentFiles={currentFiles}
      currentSubmission={currentSubmission}
      message={message}
      saving={saving}
      selectedFiles={selectedFiles}
      studentHeaderLabel={studentHeaderLabel}
      submissionText={submissionText}
      onRemoveSelectedFile={handleRemoveSelectedFile}
      onSelectFiles={handleStudentFiles}
      onSetSubmissionText={setSubmissionText}
      onSubmitStudentWork={handleSubmitStudentWork}
    />
  )
}
