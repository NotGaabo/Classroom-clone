'use client'

import { Comment } from '@/types/assignments'
import { formatShortDate } from '@/utils/dateFormat'
import { RefObject } from 'react'

interface Props {
  comments: Comment[]
  newComment: string
  setNewComment: (value: string) => void
  submitting: boolean
  handleSubmitComment: () => void
  commentsEndRef: RefObject<HTMLDivElement | null>
}

export default function CommentsSection({
  comments,
  newComment,
  setNewComment,
  submitting,
  handleSubmitComment,
  commentsEndRef,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Comentarios de la clase</h2>
            <p className="mt-1 text-sm text-slate-500">
              Conversación visible para quienes participan en esta actividad.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {comments.length}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !submitting && newComment.trim()) {
                  event.preventDefault()
                  handleSubmitComment()
                }
              }}
              rows={3}
              placeholder="Añadir comentario de clase..."
              className="w-full rounded-[22px] border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-500 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
              disabled={submitting}
            />

            {newComment.trim() && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={submitting}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Enviando...' : 'Publicar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[540px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">Todavía no hay comentarios</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {comments.map((comment) => (
              <div key={comment.id} className="px-6 py-5">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-slate-900">
                        {comment.user_name || 'Usuario'}
                      </span>
                      <span className="text-xs text-slate-500">{formatShortDate(comment.created_at)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>
    </section>
  )
}
