'use client'

import React, { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import UserMenu from '@/components/base/header/UserMenu'
import { CreateClassModal } from '@/features/classes/components/CreateClassModal'
import { DashboardClassGrid } from '@/features/classes/components/DashboardClassGrid'
import { DashboardEmptyState } from '@/features/classes/components/DashboardEmptyState'
import { DashboardSidebar } from '@/features/classes/components/DashboardSidebar'
import { JoinClassModal } from '@/features/classes/components/JoinClassModal'

export default function ClassroomDashboard() {
  const {
    goToClass,
    deleteClass,
    getTeacherInitials,
    getTeacherName,
    getPaletteForClass,
    createClass,
    dropdownRef,
    joinClass,
    classes,
    showCreateModal,
    setShowCreateModal,
    showJoinModal,
    setShowJoinModal,
    showDropdown,
    setShowDropdown,
    showSidebar,
    setShowSidebar,
    name,
    setName,
    description,
    setDescription,
    joinCode,
    setJoinCode,
    loading,
    joinLoading,
    fetchingClasses,
    formatDate,
    averageProgress
  } = useDashboard()

  const [searchTerm, setSearchTerm] = useState('')

  const filteredClasses = classes.filter(
    cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)' }} className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: 'var(--color-neutral-200)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%)' }}
                >
                  C
                </div>
                <span className="text-xl font-semibold text-gray-900">Classroom</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--text-tertiary)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar clases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border"
                  style={{
                    borderColor: 'var(--color-neutral-300)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary hidden sm:inline-flex text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva clase
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn btn-secondary hidden sm:inline-flex text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Unirse
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {showDropdown && <UserMenu />}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar averageProgress={averageProgress} />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Actions */}
          <div className="sm:hidden flex gap-2 mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex-1"
            >
              Nueva clase
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn btn-secondary flex-1"
            >
              Unirse
            </button>
          </div>

          {/* Section Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Tus clases
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {filteredClasses.length} clase{filteredClasses.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Empty State */}
          {fetchingClasses && classes.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Cargando clases...</p>
              </div>
            </div>
          ) : filteredClasses.length === 0 ? (
            <DashboardEmptyState 
              onCreate={() => setShowCreateModal(true)}
              onJoin={() => setShowJoinModal(true)}
            />
          ) : (
            <DashboardClassGrid 
              classes={filteredClasses}
              formatDate={formatDate}
              getPaletteForClass={getPaletteForClass}
              getTeacherInitials={getTeacherInitials}
              getTeacherName={getTeacherName}
              onCreateClass={() => setShowCreateModal(true)}
              onDeleteClass={deleteClass}
              onOpenClass={goToClass}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateClassModal
          description={description}
          name={name}
          onClose={() => setShowCreateModal(false)}
          onCreate={createClass}
          onDescriptionChange={setDescription}
          onNameChange={setName}
          loading={loading}
        />
      )}
      {showJoinModal && (
        <JoinClassModal
          joinCode={joinCode}
          joinLoading={joinLoading}
          onClose={() => setShowJoinModal(false)}
          onJoin={joinClass}
          onJoinCodeChange={setJoinCode}
        />
      )}
    </div>
  )
}
