'use client'

import React from 'react'
import { Class } from '@/types/class'

interface DashboardClassGridProps {
  classes: Class[]
  onClassClick: (classId: string) => void
  onDeleteClass: (classId: string, className: string) => void
}

const CLASS_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
]

export function DashboardClassGrid({
  classes,
  onClassClick,
  onDeleteClass,
}: DashboardClassGridProps) {
  const getGradient = (index: number) => CLASS_COLORS[index % CLASS_COLORS.length]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {classes.map((classItem, index) => (
        <div
          key={classItem.id}
          className="group cursor-pointer card overflow-hidden hover:shadow-lg transition-all"
          onClick={() => onClassClick(classItem.id)}
        >
          {/* Class Header with Gradient */}
          <div
            className="h-32 p-5 flex flex-col justify-between relative overflow-hidden"
            style={{ background: getGradient(index) }}
          >
            <div className="relative z-10">
              <h3 className="text-white font-semibold text-lg line-clamp-2 leading-snug">
                {classItem.name}
              </h3>
              {classItem.description && (
                <p className="text-white/80 text-sm line-clamp-1 mt-1">
                  {classItem.description}
                </p>
              )}
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>
          </div>

          {/* Class Info */}
          <div className="p-4 flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                PROFESOR
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {classItem.teacher_name || 'Sin profesor'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-neutral-200)' }}>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {classItem.created_at ? new Date(classItem.created_at).getFullYear() : ''}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClass(classItem.id, classItem.name)
                }}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar clase"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
