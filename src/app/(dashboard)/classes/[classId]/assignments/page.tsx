'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Assignment } from '@/types/assignments'

export default function AssignmentsListPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (classId) {
      fetchAssignments()
      setupRealtimeSubscription()
    }
    return () => {
      const supabase = createClient()
      supabase.channel('assignments-list').unsubscribe()
    }
  }, [classId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAssignments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/assignments?class_id=${classId}`)
      if (!res.ok) throw new Error('Error al cargar las asignaciones')
      const data = await res.json()
      setAssignments(data)
    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError('No se pudieron cargar las asignaciones')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const supabase = createClient()
    const channel = supabase
      .channel('assignments-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments', filter: `class_id=eq.${classId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAssignments(prev => [payload.new as Assignment, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAssignments(prev => prev.map(a => a.id === payload.new.id ? (payload.new as Assignment) : a))
          } else if (payload.eventType === 'DELETE') {
            setAssignments(prev => prev.filter(a => a.id !== payload.old.id))
          }
        })
      .subscribe()
    return () => { channel.unsubscribe() }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()

  const handleAssignmentClick = (assignmentId: string) => {
    router.push(`/classes/${classId}/assignment/${assignmentId}`)
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        body {
          font-family: 'Sora', sans-serif;
          background: #ffffff;
        }

        .asg-root {
          min-height: 100vh;
          background: #f8fafc;
          background-image:
            radial-gradient(ellipse 80% 50% at 20% -20%, rgba(99,102,241,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(6,182,212,0.05) 0%, transparent 60%);
          color: #1e293b;
        }

        /* ── Header ── */
        .asg-header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
          height: 64px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .asg-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .asg-logo-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(99,102,241,0.2);
        }

        .asg-logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .asg-logo-text span { color: #6366f1; }

        .asg-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          color: #fff;
          font-weight: 600;
          font-size: 0.8125rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
          letter-spacing: 0.01em;
          box-shadow: 0 2px 12px rgba(99,102,241,0.25);
        }

        .asg-btn-primary:hover {
          background: linear-gradient(135deg, #4f46e5, #0891b2);
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          transform: translateY(-1px);
        }

        .asg-chevron { transition: transform 0.2s; }
        .asg-chevron.open { transform: rotate(180deg); }

        .asg-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 220px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          z-index: 100;
          animation: dropIn 0.15s ease-out;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .asg-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 9px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #475569;
          transition: all 0.15s;
          text-align: left;
        }

        .asg-dropdown-item:hover { background: #f1f5f9; color: #1e293b; }

        .asg-dropdown-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .asg-dropdown-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }

        .asg-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #312e81, #4338ca);
          border: 2px solid rgba(99,102,241,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
        }

        /* ── Sidebar ── */
        .asg-sidebar {
          width: 240px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          min-height: calc(100vh - 64px);
          padding: 20px 12px;
          flex-shrink: 0;
        }

        .asg-sidebar-section { margin-bottom: 28px; }

        .asg-sidebar-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .asg-nav-item {
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

        .asg-nav-item:hover { background: #f1f5f9; color: #334155; }

        .asg-nav-item.active {
          background: rgba(99,102,241,0.08);
          color: #4f46e5;
          border: 1px solid rgba(99,102,241,0.15);
        }

        /* ── Mobile ── */
        .asg-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 40;
        }

        .asg-sidebar-mobile {
          position: fixed;
          top: 64px;
          left: 0;
          z-index: 45;
          transition: transform 0.3s ease;
        }

        @media (min-width: 1024px) {
          .asg-sidebar-mobile { position: sticky; transform: none !important; }
          .asg-mobile-menu-btn { display: none !important; }
        }

        @media (max-width: 1023px) {
          .asg-header-search { display: none !important; }
          .asg-header-new-label { display: none !important; }
          .asg-mobile-menu-btn { display: flex !important; }
        }

        @media (max-width: 767px) {
          .asg-main-pad { padding: 20px 16px !important; }
          .asg-header-inner { padding: 0 16px !important; }
        }

        /* ── Spinner ── */
        .asg-spin-ring {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99,102,241,0.12);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Assignment cards ── */
        .asg-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 22px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .asg-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99,102,241,0.2);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }

        .asg-card-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #06b6d4);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .asg-card:hover .asg-card-accent { transform: scaleX(1); }

        .asg-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.2);
          transition: transform 0.2s;
        }

        .asg-card:hover .asg-card-icon { transform: scale(1.05); }

        .asg-card-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
          transition: color 0.15s;
          line-height: 1.4;
        }

        .asg-card:hover .asg-card-title { color: #4f46e5; }

        .asg-card-desc {
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .asg-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
        }

        .asg-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .asg-meta-item.overdue { color: #dc2626; font-weight: 600; }

        .asg-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .asg-badge.submitted {
          background: rgba(16,185,129,0.1);
          color: #059669;
          border: 1px solid rgba(16,185,129,0.2);
        }

        .asg-badge.points {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .asg-chevron-right {
          color: #cbd5e1;
          flex-shrink: 0;
          margin-left: auto;
          align-self: center;
          transition: all 0.15s;
        }

        .asg-card:hover .asg-chevron-right { color: #6366f1; transform: translateX(3px); }

        /* ── Live badge ── */
        .asg-live {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        /* ── Empty state ── */
        .asg-empty {
          background: #ffffff;
          border: 2px dashed #e2e8f0;
          border-radius: 16px;
          padding: 72px 24px;
          text-align: center;
        }

        .asg-empty-icon {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        /* ── Error card ── */
        .asg-error-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #6366f1;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        /* ── Stagger animation ── */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="asg-root">

        {/* ── Header ── */}
        <header className="asg-header">
          <div className="asg-header-inner">
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="asg-mobile-menu-btn"
                style={{ padding: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', color: '#64748b', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="asg-logo-icon">
                  <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="asg-logo-text">Auli<span>fy</span></div>
              </div>
            </div>

            {/* Center search */}
            <div className="asg-header-search" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 5, border: '1px solid #e2e8f0' }}>⌘K</span>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#94a3b8', position: 'relative' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#6366f1', border: '1.5px solid #ffffff' }}></span>
              </button>

              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button className="asg-btn-primary" onClick={() => setShowDropdown(!showDropdown)}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="asg-header-new-label">Nueva</span>
                  <svg className={`asg-chevron ${showDropdown ? 'open' : ''}`} width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="asg-dropdown">
                    <button className="asg-dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span className="asg-dropdown-icon" style={{ background: 'rgba(6,182,212,0.08)' }}>
                        <svg width="15" height="15" fill="none" stroke="#0891b2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ color: '#334155' }}>Unirse a una clase</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 1 }}>Con código de invitación</div>
                      </div>
                    </button>
                    <div className="asg-dropdown-divider" />
                    <button className="asg-dropdown-item" onClick={() => setShowDropdown(false)}>
                      <span className="asg-dropdown-icon" style={{ background: 'rgba(99,102,241,0.08)' }}>
                        <svg width="15" height="15" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ color: '#334155' }}>Crear una clase</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 1 }}>Como instructor</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="asg-avatar">TU</div>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex' }}>
          {/* Mobile overlay */}
          {showSidebar && (
            <div className="asg-mobile-overlay" onClick={() => setShowSidebar(false)} />
          )}

          {/* ── Sidebar ── */}
          <aside
            className="asg-sidebar-mobile"
            style={{ transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            <div className="asg-sidebar">
              <div className="asg-sidebar-section">
                <div className="asg-sidebar-label">Principal</div>
                <button className="asg-nav-item" onClick={() => router.push('/')}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
                <button className="asg-nav-item" onClick={() => router.push('/')}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Mis Clases
                </button>
                <button className="asg-nav-item active">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Tareas
                </button>
                <button className="asg-nav-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendario
                </button>
              </div>

              <div className="asg-sidebar-section">
                <div className="asg-sidebar-label">Progreso</div>
                <button className="asg-nav-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Calificaciones
                </button>
                <button className="asg-nav-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Logros
                </button>
              </div>

              <div className="asg-sidebar-section">
                <div className="asg-sidebar-label">Sistema</div>
                <button className="asg-nav-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración
                </button>
              </div>

              {/* Quick stats widget */}
              <div style={{ padding: '14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12, marginTop: 8 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Esta clase</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Asignaciones</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{assignments.length}</span>
                </div>
                <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Entregadas</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                    {assignments.filter(a => a.status === 'submitted').length}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="asg-main-pad" style={{ flex: 1, padding: '32px 32px', overflowX: 'hidden' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>

              {/* Page header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Trabajo de clase
                  </h1>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>
                    {assignments.length} {assignments.length === 1 ? 'asignación' : 'asignaciones'}
                  </p>
                </div>

                {/* Live indicator */}
                <div className="asg-live">
                  <div style={{ position: 'relative', width: 8, height: 8 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }}></div>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}></div>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>En vivo</span>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="asg-spin-ring" style={{ margin: '0 auto 16px' }}></div>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Cargando asignaciones...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="asg-error-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4, fontSize: '0.9375rem' }}>Error al cargar</h3>
                      <p style={{ color: '#64748b', fontSize: '0.8125rem', marginBottom: 14 }}>{error}</p>
                      <button
                        onClick={fetchAssignments}
                        style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', borderRadius: 8, border: 'none', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="asg-empty">
                  <div className="asg-empty-icon">
                    <svg width="32" height="32" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    No hay asignaciones aún
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    Las asignaciones aparecerán aquí cuando el profesor las publique
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {assignments.map((assignment, index) => (
                    <div
                      key={assignment.id}
                      className="asg-card"
                      onClick={() => handleAssignmentClick(assignment.id)}
                      style={{ animation: `cardIn 0.3s ease-out ${index * 0.05}s backwards` }}
                    >
                      {/* Icon */}
                      <div className="asg-card-icon">
                        <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                          <div className="asg-card-title">{assignment.title}</div>
                          {assignment.points && (
                            <span className="asg-badge points">{assignment.points} pts</span>
                          )}
                        </div>

                        {assignment.description && (
                          <p className="asg-card-desc">{assignment.description}</p>
                        )}

                        <div className="asg-meta">
                          {assignment.due_date && (
                            <div className={`asg-meta-item ${isOverdue(assignment.due_date) ? 'overdue' : ''}`}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {isOverdue(assignment.due_date) ? 'Vencida: ' : 'Entrega: '}
                              {formatDate(assignment.due_date)}
                            </div>
                          )}

                          <div className="asg-meta-item">
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Publicada {formatDate(assignment.created_at)}
                          </div>

                          {assignment.status === 'submitted' && (
                            <span className="asg-badge submitted">
                              <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Entregado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chevron */}
                      <svg className="asg-chevron-right" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>

                      {/* Accent bar */}
                      <div className="asg-card-accent"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        <style>{`
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `}</style>
      </div>
    </>
  )
}