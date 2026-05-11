interface DashboardEmptyStateProps {
  onCreate: () => void
  onJoin: () => void
}

export function DashboardEmptyState({ onCreate, onJoin }: DashboardEmptyStateProps) {
  return (
    <div className="lms-empty">
      <div>
        <div className="lms-empty-icon">
          <svg width="32" height="32" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="lms-empty-title">No tienes clases aún</div>
        <div className="lms-empty-sub">Crea tu primera clase o únete con un código</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="lms-btn-ghost" onClick={onJoin}>
            Unirse a clase
          </button>
          <button className="lms-btn-submit amber" onClick={onCreate}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Crear clase
          </button>
        </div>
      </div>
    </div>
  )
}
