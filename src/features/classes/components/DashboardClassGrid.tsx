import { ClassListItem } from '@/features/classes/hooks/useClassList'

interface Palette {
  accent: string
  from: string
  to: string
}

interface DashboardClassGridProps {
  classes: ClassListItem[]
  formatDate: (value: string) => string
  getPaletteForClass: (classId: string) => Palette
  getTeacherInitials: (classItem: ClassListItem) => string
  getTeacherName: (classItem: ClassListItem) => string
  onCreateClass: () => void
  onDeleteClass: (classId: string, className: string) => void
  onOpenClass: (classId: string) => void
}

export function DashboardClassGrid({
  classes,
  formatDate,
  getPaletteForClass,
  getTeacherInitials,
  getTeacherName,
  onCreateClass,
  onDeleteClass,
  onOpenClass,
}: DashboardClassGridProps) {
  return (
    <>
      <div className="lms-section-header">
        <div>
          <div className="lms-section-title">Todas las clases</div>
          <div className="lms-section-subtitle">Semestre actual</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              fontFamily: 'Sora, sans-serif',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrar
          </button>
        </div>
      </div>

      <div className="lms-grid">
        {classes.map((classItem, index) => {
          const palette = getPaletteForClass(classItem.id)

          return (
            <div
              key={classItem.id}
              className="lms-card"
              onClick={() => onOpenClass(classItem.id)}
              style={{ animation: `cardIn 0.3s ease-out ${index * 0.06}s backwards` }}
            >
              <div
                className="lms-card-header"
                style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
              >
                <div className="lms-card-pattern" />
                <div className="lms-card-badge">Activa</div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: palette.accent,
                    opacity: 0.15,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: '#fff',
                    opacity: 0.05,
                  }}
                />

                <div className="lms-card-title">{classItem.name}</div>
                <div className="lms-card-desc">{classItem.description || 'Sin descripción'}</div>
                <div
                  className="lms-card-accent-bar"
                  style={{ background: `linear-gradient(90deg, ${palette.accent}, transparent)` }}
                />
              </div>

              <div className="lms-card-body">
                <div className="lms-teacher-row">
                  <div
                    className="lms-teacher-avatar"
                    style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                  >
                    {getTeacherInitials(classItem)}
                  </div>
                  <div>
                    <div className="lms-teacher-info-name">{getTeacherName(classItem)}</div>
                    <div className="lms-teacher-info-date">
                      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(classItem.created_at)}
                    </div>
                  </div>
                </div>

                {classItem.code && (
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: '#94a3b8',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        marginBottom: 6,
                      }}
                    >
                      Código de clase
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'DM Mono, monospace',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          letterSpacing: '0.16em',
                        }}
                      >
                        {classItem.code}
                      </span>
                      <button
                        className="lms-card-action"
                        style={{ width: 26, height: 26 }}
                        onClick={(event) => {
                          event.stopPropagation()
                          navigator.clipboard.writeText(classItem.code ?? '')
                        }}
                        title="Copiar código"
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 10h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {classItem.my_role === 'student' && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: '#94a3b8',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                        }}
                      >
                        Progreso del curso
                      </span>
                      <span style={{ fontSize: '0.65rem', color: palette.accent, fontWeight: 700 }}>
                        {classItem.progress ?? 0}%
                      </span>
                    </div>
                    <div style={{ height: 3, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${classItem.progress ?? 0}%`,
                          background: palette.accent,
                          borderRadius: 99,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="lms-card-footer">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="lms-card-action"
                      onClick={(event) => event.stopPropagation()}
                      title="Miembros"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </button>
                    <button
                      className="lms-card-action danger"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeleteClass(classItem.id, classItem.name)
                      }}
                      title="Eliminar"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 10px',
                      borderRadius: 7,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Sora, sans-serif',
                      transition: 'all 0.15s',
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenClass(classItem.id)
                    }}
                  >
                    Abrir
                    <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        <button className="lms-add-card" onClick={onCreateClass}>
          <div className="lms-add-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="lms-add-label">Crear nueva clase</div>
        </button>
      </div>
    </>
  )
}
