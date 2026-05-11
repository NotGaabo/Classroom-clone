import { AssignmentSubmission } from '@/types/assignments'

interface SubmissionFeedbackCardProps {
  submission: AssignmentSubmission | null | undefined
}

export function SubmissionFeedbackCard({ submission }: SubmissionFeedbackCardProps) {
  if (!submission?.feedback && submission?.score === null) {
    return null
  }

  return (
    <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
        Retroalimentación del profesor
      </p>
      {submission?.score !== null && submission?.score !== undefined && (
        <p className="mt-2 text-xl font-semibold text-slate-900">{submission.score}</p>
      )}
      {submission?.feedback && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {submission.feedback}
        </p>
      )}
    </div>
  )
}
