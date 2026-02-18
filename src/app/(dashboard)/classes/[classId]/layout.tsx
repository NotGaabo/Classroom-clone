'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClassLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ classId: string }> | { classId: string }
}) {
  const pathname = usePathname()
  const [classId, setClassId] = useState<string>('')
  const [className, setClassName] = useState<string>('Cargando...')
  const [classDescription, setClassDescription] = useState<string>('')

  useEffect(() => {
    const resolveParams = async () => {
      const p: any = params
      const id = typeof p?.then === 'function' ? (await p).classId : p.classId
      setClassId(id)
      
      // Fetch class data
      try {
        const res = await fetch(`/api/classes/${id}`)
        if (res.ok) {
          const data = await res.json()
          setClassName(data.name || 'Clase')
          setClassDescription(data.description || '')
        }
      } catch (error) {
        console.error('Error loading class:', error)
      }
    }
    
    resolveParams()
  }, [params])

  const isActive = (href: string) => {
    if (href === `/classes/${classId}`) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Hero Banner */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            {/* Red accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

            <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                      {className}
                    </h1>
                    {classDescription && (
                      <p className="text-gray-300 text-sm sm:text-base max-w-3xl">
                        {classDescription}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <nav className="flex gap-1 sm:gap-2 -mb-px overflow-x-auto scrollbar-hide">
                <Tab 
                  href={`/classes/${classId}`} 
                  active={isActive(`/classes/${classId}`)}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span className="hidden sm:inline">Tablón</span>
                  <span className="sm:hidden">Inicio</span>
                </Tab>
                
                <Tab 
                  href={`/classes/${classId}/assignments`} 
                  active={isActive(`/classes/${classId}/assignments`)}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Trabajo
                </Tab>
                
                <Tab 
                  href={`/classes/${classId}/students`} 
                  active={isActive(`/classes/${classId}/students`)}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Personas
                </Tab>
                
                <Tab 
                  href={`/classes/${classId}/grades`} 
                  active={isActive(`/classes/${classId}/grades`)}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="hidden sm:inline">Calificaciones</span>
                  <span className="sm:hidden">Notas</span>
                </Tab>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

function Tab({ 
  href, 
  children, 
  active 
}: { 
  href: string
  children: React.ReactNode
  active: boolean 
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 
        text-sm sm:text-base font-medium 
        border-b-2 transition-all duration-200
        whitespace-nowrap
        ${active 
          ? 'border-red-600 text-red-600 bg-red-50/50' 
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {children}
    </Link>
  )
}