'use client'

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Crear nueva clase
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Como instructor
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Nombre de la clase *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Ej: Matemáticas Avanzadas 2025"
                disabled={loading}
                autoFocus
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe de qué trata tu clase..."
                disabled={loading}
                rows={4}
                className="input w-full resize-none"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Máximo 500 caracteres
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl" style={{ borderColor: 'var(--color-neutral-200)' }}>
            <button
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={onCreate}
              disabled={loading || !name.trim()}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
