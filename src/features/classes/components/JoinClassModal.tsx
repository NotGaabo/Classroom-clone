'use client'

interface JoinClassModalProps {
  joinCode: string
  joinLoading: boolean
  onClose: () => void
  onJoin: () => void
  onJoinCodeChange: (value: string) => void
}

export function JoinClassModal({
  joinCode,
  joinLoading,
  onClose,
  onJoin,
  onJoinCodeChange,
}: JoinClassModalProps) {
  return (
    <>
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-overlay {
          animation: fadeIn 200ms ease-out;
        }

        .modal-content {
          animation: modalSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Overlay */}
      <div
        className="modal-overlay fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'var(--color-neutral-200)' }}>
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-primary-50)',
                  borderColor: 'var(--color-primary-200)',
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary-600)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Unirse a una clase
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Con código de invitación
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={joinLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Solicita el código de clase a tu instructor e ingrésalo a continuación.
            </p>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Código de clase *
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => onJoinCodeChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && onJoin()}
                placeholder="ABC123"
                maxLength={10}
                disabled={joinLoading}
                autoFocus
                className="input w-full font-mono text-center text-lg letter-spacing-wide tracking-widest"
              />
            </div>

            {/* Info Box */}
            <div
              className="p-3 rounded-lg border flex gap-3 text-sm"
              style={{
                backgroundColor: 'var(--color-info-50)',
                borderColor: 'var(--color-info-200)',
                color: 'var(--color-info-700)',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>El código distingue mayúsculas y minúsculas. Ingrésalo exactamente como te lo compartió tu instructor.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl" style={{ borderColor: 'var(--color-neutral-200)' }}>
            <button
              onClick={onClose}
              disabled={joinLoading}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={onJoin}
              disabled={joinLoading || !joinCode.trim()}
              className="btn btn-primary flex-1"
            >
              {joinLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uniéndose...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Unirse
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
