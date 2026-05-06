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
  commentsEndRef
}: Props) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-900">
            Comentarios de la clase
          </h2>
          {comments.length > 0 && (
            <span className="ml-auto text-sm font-medium text-slate-500">
              {comments.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {comments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="p-6 hover:bg-gray-50 transition-colors duration-150"
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`
                }}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-500 shadow-sm">
                      <span className="text-white text-sm font-bold">
                        {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="font-semibold text-slate-900 text-sm">
                        {comment.user_name || 'Usuario'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatShortDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div ref={commentsEndRef} />
          </div>
        ) : (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              No hay comentarios aún
            </p>
            <p className="text-slate-400 text-xs mt-1">
              ¡Sé el primero en comentar!
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-grow">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !submitting && newComment.trim()) {
                  handleSubmitComment()
                }
              }}
              placeholder="Añade un comentario de clase..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />

            {newComment.trim() && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setNewComment('')}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Comentar'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
