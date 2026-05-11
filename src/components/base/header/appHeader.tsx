'use client'

import { useState, useRef, useEffect } from 'react'
import UserMenu from '@/components/base/header/UserMenu'

interface AppHeaderProps {
  onMenuToggle?: () => void
  showMenuButton?: boolean
}

export default function AppHeader({ onMenuToggle, showMenuButton = true }: AppHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header 
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--color-neutral-200)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.2)',
                }}
              >
                C
              </div>
              <span className="hidden sm:block text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Classroom
              </span>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="User menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50" style={{ borderColor: 'var(--color-neutral-200)' }}>
                  <UserMenu />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        header {
          backdrop-filter: blur(10px);
          background-color: rgba(255, 255, 255, 0.95);
        }
      `}</style>
    </header>
  )
}
