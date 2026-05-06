// components/common/FileViewer/ImageViewer.tsx

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileMetadata } from '@/types/file'

interface ImageViewerProps {
  file: FileMetadata
  onError?: (error: Error) => void
}

export default function ImageViewer({ file, onError }: ImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const handleError = (err: Error) => {
    setError(err)
    onError?.(err)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 text-sm">Error al cargar la imagen</p>
          <p className="text-gray-400 text-xs mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Cargando imagen...</p>
          </div>
        </div>
      )}
      
      <img
        src={file.url}
        alt={file.name}
        className="max-w-full max-h-full object-contain"
        onLoad={() => setIsLoading(false)}
        onError={() => handleError(new Error('No se pudo cargar la imagen'))}
      />
    </div>
  )
}
