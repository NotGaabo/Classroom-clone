'use client'

import { useState } from 'react'
import { FileMetadata } from '@/types/file'

interface VideoViewerProps {
  file: FileMetadata
  onError?: (error: Error) => void
}

export default function VideoViewer({ file, onError }: VideoViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const handleError = (message: string) => {
    const nextError = new Error(message)
    setError(nextError)
    onError?.(nextError)
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">No se pudo reproducir el video</p>
          <p className="mt-1 text-xs text-gray-500">{error.message}</p>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Abrir video
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/70">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-white" />
            <p className="text-sm text-slate-200">Cargando video...</p>
          </div>
        </div>
      )}

      <video
        controls
        className="h-full w-full"
        onCanPlay={() => setIsLoading(false)}
        onError={() => handleError('El navegador no pudo cargar este archivo de video.')}
      >
        <source src={file.url} type={file.mimeType} />
        Tu navegador no soporta reproducción de video incrustada.
      </video>
    </div>
  )
}
