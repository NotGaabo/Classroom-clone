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
    <div className="lms-overlay" onClick={onClose}>
      <div className="lms-modal" onClick={(event) => event.stopPropagation()}>
        <div className="lms-modal-header">
          <div className="lms-modal-title-row">
            <div
              className="lms-modal-icon"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}
            >
              <svg width="18" height="18" fill="none" stroke="#06b6d4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="lms-modal-title">Unirse a una clase</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>Con código de invitación</div>
            </div>
          </div>
          <button className="lms-modal-close" onClick={onClose}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="lms-modal-body">
          <div className="space-y">
            <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6 }}>
              Solicita el código de clase a tu instructor e ingrésalo a continuación.
            </p>
            <div>
              <label className="lms-label">Código de clase *</label>
              <input
                className="lms-input lms-code-input blue"
                type="text"
                value={joinCode}
                onChange={(event) => onJoinCodeChange(event.target.value.toUpperCase())}
                onKeyDown={(event) => event.key === 'Enter' && onJoin()}
                placeholder="ABC123"
                maxLength={10}
                disabled={joinLoading}
                autoFocus
              />
            </div>
            <div
              className="lms-info-box"
              style={{
                background: 'rgba(6,182,212,0.05)',
                border: '1px solid rgba(6,182,212,0.12)',
                color: '#0891b2',
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                El código distingue mayúsculas y minúsculas. Ingrésalo exactamente como te lo compartió tu instructor.
              </span>
            </div>
          </div>
        </div>

        <div className="lms-modal-footer">
          <button className="lms-btn-ghost" onClick={onClose} disabled={joinLoading}>
            Cancelar
          </button>
          <button className="lms-btn-submit blue" onClick={onJoin} disabled={joinLoading || !joinCode.trim()}>
            {joinLoading ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                Uniéndose...
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Unirse
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
