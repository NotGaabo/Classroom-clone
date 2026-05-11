interface CreateClassModalProps {
  description: string
  loading: boolean
  name: string
  onClose: () => void
  onCreate: () => void
  onDescriptionChange: (value: string) => void
  onNameChange: (value: string) => void
}

export function CreateClassModal({
  description,
  loading,
  name,
  onClose,
  onCreate,
  onDescriptionChange,
  onNameChange,
}: CreateClassModalProps) {
  return (
    <div className="lms-overlay" onClick={onClose}>
      <div className="lms-modal" onClick={(event) => event.stopPropagation()}>
        <div className="lms-modal-header">
          <div className="lms-modal-title-row">
            <div
              className="lms-modal-icon"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <svg width="18" height="18" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div className="lms-modal-title">Crear clase</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>Como instructor</div>
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
            <div>
              <label className="lms-label">Nombre de la clase *</label>
              <input
                className="lms-input"
                type="text"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Ej: Matemáticas Avanzadas 2025"
                disabled={loading}
                autoFocus
              />
            </div>
            <div>
              <label className="lms-label">Descripción</label>
              <textarea
                className="lms-input lms-textarea"
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Describe de qué trata tu clase..."
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="lms-modal-footer">
          <button className="lms-btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="lms-btn-submit amber" onClick={onCreate} disabled={loading || !name.trim()}>
            {loading ? (
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
                Creando...
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Crear clase
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
