'use client'

import { useRouter, usePathname } from 'next/navigation'

interface Assignment {
  id: string
  status?: string
}

interface AppSidebarProps {
  assignments?: Assignment[]
  activeItem?: 'dashboard' | 'clases' | 'tareas' | 'calendario' | 'calificaciones' | 'students'
}

const NAV_ITEMS = [
  {
    key: 'clases',
    label: 'Mis Clases',
    href: '/dashboard',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    key: 'tareas',
    label: 'Tareas',
    href: null, // current page
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
  },
  {
    key: 'calendario',
    label: 'Calendario',
    href: null,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
]

const PROGRESS_ITEMS = [
  {
    key: 'calificaciones',
    label: 'Calificaciones',
    href: null,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    key: 'students',
    label: 'Personas',
    href: null,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
]

export default function AppSidebar({ assignments = [], activeItem }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const classMatch = pathname.match(/^\/classes\/([^/]+)/)
  const classId = classMatch?.[1] ?? null

  const navItems = NAV_ITEMS.map((item) => {
    if (!classId) return item
    if (item.key === 'tareas') return { ...item, href: `/classes/${classId}` }
    if (item.key === 'calendario') return { ...item, href: `/classes/${classId}/calendario` }
    return item
  })

  const progressItems = PROGRESS_ITEMS.map((item) => {
    if (!classId) return item
    if (item.key === 'calificaciones') return { ...item, href: `/classes/${classId}/grades` }
    if (item.key === 'students') return { ...item, href: `/classes/${classId}/students` }
    return item
  })

  const isActive = (key: string) => {
    if (activeItem) return activeItem === key
    if (key === 'clases') return pathname === '/dashboard' || pathname === '/classes'
    if (key === 'tareas') return /^\/classes\/[^/]+(?:\/assignment\/[^/]+)?$/.test(pathname)
    if (key === 'calendario') return pathname.includes('/calendario')
    if (key === 'calificaciones') return pathname.includes('/grades')
    if (key === 'students') return pathname.includes('/students')
    return false
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        .app-sidebar {
          width: 240px;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(18px);
          border-right: 1px solid rgba(148,163,184,0.18);
          min-height: calc(100vh - 64px);
          padding: 20px 12px;
          flex-shrink: 0;
          font-family: 'Sora', sans-serif;
        }

        .app-sidebar-section { margin-bottom: 28px; }

        .app-sidebar-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .app-sidebar-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #64748b;
          transition: all 0.15s;
          text-align: left;
        }

        .app-sidebar-nav-item:hover {
          background: #f8fafc;
          color: #334155;
        }

        .app-sidebar-nav-item.active {
          background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.08));
          color: #1d4ed8;
          border: 1px solid rgba(59,130,246,0.16);
        }

        .app-sidebar-stats {
          padding: 14px 14px 12px;
          background: linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.92));
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 16px;
          margin-top: 8px;
          box-shadow: 0 12px 26px rgba(15,23,42,0.04);
        }

        .app-sidebar-stats-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #1d4ed8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .app-sidebar-stats-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .app-sidebar-stats-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .app-sidebar-stats-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
        }

        .app-sidebar-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }
      `}</style>

      <div className="app-sidebar">
        <div className="app-sidebar-section">
          <div className="app-sidebar-label">Principal</div>

          {navItems.map((item) => (
            <button
              key={item.key}
              className={`app-sidebar-nav-item ${isActive(item.key) ? 'active' : ''}`}
              onClick={() => item.href && router.push(item.href)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              {item.label}
            </button>
          ))}
        </div>

        <div className="app-sidebar-section">
          <div className="app-sidebar-label">Progreso</div>

          {progressItems.map((item) => (
            <button
              key={item.key}
              className={`app-sidebar-nav-item ${isActive(item.key) ? 'active' : ''}`}
              onClick={() => item.href && router.push(item.href)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              {item.label}
            </button>
          ))}
        </div>
        {assignments.length > 0 && (
          <div className="app-sidebar-stats">
            <div className="app-sidebar-stats-title">Esta clase</div>
            <div className="app-sidebar-stats-row">
              <span className="app-sidebar-stats-label">Asignaciones</span>
              <span className="app-sidebar-stats-value">{assignments.length}</span>
            </div>
            <div className="app-sidebar-divider" />
            <div className="app-sidebar-stats-row">
              <span className="app-sidebar-stats-label">Entregadas</span>
              <span className="app-sidebar-stats-value" style={{ color: '#0f766e' }}>
                {assignments.filter(a => a.status === 'submitted').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
