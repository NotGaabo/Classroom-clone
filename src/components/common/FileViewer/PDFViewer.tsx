// components/common/FileViewer/PDFViewer.tsx

'use client'

import { useState } from 'react'
import { FileMetadata } from '@/types/file'

interface PDFViewerProps {
  file: FileMetadata
  onError?: (error: Error) => void
}

export default function PDFViewer({ file, onError }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const handleError = (err: Error) => {
    setError(err)
    onError?.(err)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 6v2M7.08 6.47A9 9 0 1020.92 17.53M7.08 6.47L4.6 4" />
          </svg>
          <p className="text-gray-600 text-sm font-medium mb-2">Error al cargar el PDF</p>
          <p className="text-gray-400 text-xs">{error.message}</p>
          <a
            href={file.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm mt-4 inline-flex items-center gap-1"
          >
            Abrir PDF
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-50 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Cargando PDF...</p>
          </div>
        </div>
      )}

      {/* Header con info del PDF */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.5 3h15A1.5 1.5 0 0121 4.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 014.5 19.5v-15A1.5 1.5 0 016 3zm0 1.5v15h15v-15h-15z" />
            <path d="M9 8h6v1.5H9V8zm0 3h6v1.5H9v-1.5zm0 3h3v1.5H9v-1.5z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">Visor de PDF incrustado</p>
          </div>
        </div>
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Abrir en nueva pestaña"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* PDF Viewer usando iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={`${file.url}#toolbar=0`}
          className="w-full h-full border-0"
          title={file.name}
          onLoad={() => setIsLoading(false)}
          onError={() => handleError(new Error('No se pudo cargar el visor de PDF'))}
        />
      </div>

      {/* Fallback info */}
      <div className="absolute bottom-4 right-4 hidden">
        <p className="text-xs text-gray-500">
          Para mejor experiencia, considera descargar el PDF
        </p>
      </div>
    </div>
  )
}
