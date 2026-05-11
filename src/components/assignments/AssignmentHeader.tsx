'use client'

import { useRouter } from 'next/navigation'

interface Props {
  isOnline: boolean
}

export default function AssignmentHeader({ isOnline }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
      >
        <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a trabajo de clase
      </button>

      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
        <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {isOnline ? 'Sincronizado' : 'Sin conexión'}
      </div>
    </div>
  )
}
