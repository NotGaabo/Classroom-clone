'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  initials?: string
  className?: string
}

export default function UserMenu({ initials = 'TU', className }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      setIsSigningOut(false)
      alert('No se pudo cerrar la sesión')
      return
    }

    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      <style jsx>{`
        .user-menu-root {
          position: relative;
        }

        .user-menu-trigger {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: linear-gradient(135deg, #312e81, #4338ca);
          border: 2px solid rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 6px 18px rgba(49, 46, 129, 0.14);
        }

        .user-menu-trigger:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(49, 46, 129, 0.18);
        }

        .user-menu-trigger:disabled {
          cursor: wait;
          opacity: 0.8;
        }

        .user-menu-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 190px;
          padding: 6px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
          z-index: 120;
          animation: userMenuDropIn 0.15s ease-out;
        }

        @keyframes userMenuDropIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .user-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #334155;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .user-menu-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .user-menu-item:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .user-menu-item-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
        }

        .user-menu-subtitle {
          font-size: 0.7rem;
          font-weight: 500;
          color: #94a3b8;
          margin-top: 2px;
        }
      `}</style>

      <div className={`user-menu-root ${className ?? ''}`.trim()} ref={menuRef}>
        <button
          type="button"
          className="user-menu-trigger"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Abrir menú de usuario"
          aria-expanded={isOpen}
          disabled={isSigningOut}
        >
          {initials}
        </button>

        {isOpen && (
          <div className="user-menu-panel">
            <button
              type="button"
              className="user-menu-item"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <span className="user-menu-item-icon">
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                </svg>
              </span>
              <span>
                <span>{isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
                <span className="user-menu-subtitle">Salir de tu cuenta actual</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
