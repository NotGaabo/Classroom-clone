'use client'

import React from 'react'

interface DashboardEmptyStateProps {
  onCreateClass: () => void
  onJoinClass: () => void
}

export function DashboardEmptyStateNew({ onCreateClass, onJoinClass }: DashboardEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.814 2 16.5S6.5 26.747 12 26.747s10-4.561 10-10.247S17.5 6.253 12 6.253z" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Aún no tienes clases
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Comienza creando una nueva clase o únete a una existente usando un código de clase.
      </p>

      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={onCreateClass}
          className="btn btn-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva clase
        </button>
        <button
          onClick={onJoinClass}
          className="btn btn-secondary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM9 19v-3a6 6 0 0112 0v3" />
          </svg>
          Unirse a clase
        </button>
      </div>
    </div>
  )
}
