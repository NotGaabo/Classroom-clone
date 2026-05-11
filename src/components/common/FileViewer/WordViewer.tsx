// components/common/FileViewer/WordViewer.tsx

'use client'

import { useState } from 'react'
import { FileMetadata } from '@/types/file'

interface WordViewerProps {
  file: FileMetadata
  onError?: (error: Error) => void
}

export default function WordViewer({ file, onError }: WordViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isPresentation = ['ppt', 'pptx'].includes(file.extension.toLowerCase())
  const documentLabel = isPresentation ? 'presentación de PowerPoint' : 'documento de Office'
  const viewerLabel = isPresentation ? 'Presentación de PowerPoint' : 'Documento de Office'

  const handleError = (err: Error) => {
    setError(err)
    onError?.(err)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-sm font-medium mb-2">No se pudo cargar el archivo</p>
          <p className="text-gray-400 text-xs mb-4">{error.message}</p>
          
          <div className="space-y-2">
            <p className="text-gray-500 text-xs">Opciones:</p>
            <div className="flex gap-2 justify-center">
              <a 
                href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Abrir en Office
              </a>
              <a 
                href={file.url}
                download={file.name}
                className="px-3 py-2 bg-gray-300 text-gray-800 text-xs rounded hover:bg-gray-400 transition-colors"
              >
                Descargar
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Cargando {documentLabel}...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{viewerLabel} (visualizador en línea)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Abrir en Office Web"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          <a 
            href={file.url}
            download={file.name}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Descargar"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>

      {/* Viewer usando Office Web */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
          className="w-full h-full border-0"
          title={file.name}
          onLoad={() => setIsLoading(false)}
          onError={() => handleError(new Error('No se pudo cargar el visor de Office'))}
          sandbox="allow-same-origin allow-scripts allow-downloads allow-popups"
        />
      </div>

      {/* Info Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-right">
        <p className="text-xs text-gray-500">
          Visualizador: Microsoft Office Web • 
          <a href={file.url} download={file.name} className="text-blue-600 hover:underline ml-1">
            Descargar original
          </a>
        </p>
      </div>
    </div>
  )
}
