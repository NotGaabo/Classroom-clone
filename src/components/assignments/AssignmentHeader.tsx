'use client'

import { useRouter } from 'next/navigation'

interface Props {
  isOnline: boolean
}

export default function AssignmentHeader({ isOnline }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between pb-4">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-200 hover:text-blue-700"
      >
        <svg 
          className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-semibold text-sm">Trabajo de clase</span>
      </button>

      <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
        <div className="relative flex items-center">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-blue-500' : 'bg-gray-400'
            }`}
          />
          {isOnline && (
            <>
              <div className="absolute w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
              <div className="absolute w-3 h-3 rounded-full bg-blue-500 opacity-30 animate-pulse"></div>
            </>
          )}
        </div>
        <span className={`text-sm font-medium ${
          isOnline ? 'text-blue-700' : 'text-gray-600'
        }`}>
          {isOnline ? 'En vivo' : 'Sin conexión'}
        </span>
      </div>
    </div>
  )
}
