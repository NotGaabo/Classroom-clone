// components/common/FileViewer/TextViewer.tsx

'use client'

import { useState, useEffect } from 'react'
import { FileMetadata } from '@/types/file'

interface TextViewerProps {
  file: FileMetadata
  onError?: (error: Error) => void
}

export default function TextViewer({ file, onError }: TextViewerProps) {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lineCount, setLineCount] = useState(0)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(file.url)
        
        if (!response.ok) {
          throw new Error(`Error al cargar el archivo: ${response.status}`)
        }

        const text = await response.text()
        setContent(text)
        setLineCount(text.split('\n').length)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error desconocido')
        setError(error)
        onError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [file.url, onError])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-sm font-medium mb-1">Error al cargar el archivo</p>
          <p className="text-gray-400 text-xs">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{lineCount} líneas</p>
          </div>
        </div>
        <a
          href={file.url}
          download={file.name}
          className="p-2 hover:bg-white rounded-lg transition-colors"
          title="Descargar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Cargando archivo...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <pre className="p-4 text-sm leading-relaxed font-mono text-gray-800 bg-gray-50 whitespace-pre-wrap break-words">
            {content}
          </pre>
        </div>
      )}

      {/* Footer */}
      {!isLoading && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-right">
          <p className="text-xs text-gray-500">
            {file.type === 'sql' ? '📊 SQL' : '📄'} • {lineCount} líneas • Última actualización: hace poco
          </p>
        </div>
      )}
    </div>
  )
}
