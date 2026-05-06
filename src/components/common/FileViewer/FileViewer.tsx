// components/common/FileViewer/FileViewer.tsx

'use client'

import { useState, useEffect } from 'react'
import { FileMetadata, FileViewerProps } from '@/types/file'
import { createFileMetadata, isSupportedFileType } from '@/utils/fileDetection'

import ImageViewer from './ImageViewer'
import PDFViewer from './PDFViewer'
import WordViewer from './WordViewer'
import TextViewer from './TextViewer'

interface InternalFileViewerProps extends FileViewerProps {
  file: FileMetadata | string
}

export default function FileViewer({
  file: fileProp,
  height = '600px',
  className = '',
  onError,
}: InternalFileViewerProps) {
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      let metadata: FileMetadata

      if (typeof fileProp === 'string') {
        // Es una URL
        metadata = createFileMetadata(fileProp)
      } else {
        // Es un objeto FileMetadata
        metadata = fileProp
      }

      if (!isSupportedFileType(metadata.type)) {
        throw new Error(
          `Tipo de archivo no soportado: ${metadata.extension}. ` +
          `Tipos soportados: imágenes (jpg, png), PDF, Word (doc, docx), TXT, SQL`
        )
      }

      setFileMetadata(metadata)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [fileProp, onError])

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center w-full rounded-lg border border-gray-200 bg-gray-50 ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Inicializando visor de archivos...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !fileMetadata) {
    return (
      <div
        className={`flex items-center justify-center w-full rounded-lg border border-red-200 bg-red-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center px-4">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 6v2M7.08 6.47A9 9 0 1120.92 17.53" />
          </svg>
          <p className="text-red-800 text-sm font-medium mb-1">Error al cargar el archivo</p>
          <p className="text-red-700 text-xs">{error?.message || 'Error desconocido'}</p>
        </div>
      </div>
    )
  }

  // Render appropriate viewer based on file type
  const containerClass = className || ''
  const containerStyle = { height }

  const viewerProps = {
    file: fileMetadata,
    onError,
  }

  switch (fileMetadata.type) {
    case 'image':
      return (
        <div className={`rounded-lg overflow-hidden border border-gray-200 ${containerClass}`} style={containerStyle}>
          <ImageViewer {...viewerProps} />
        </div>
      )

    case 'pdf':
      return (
        <div className={`rounded-lg overflow-hidden border border-gray-200 ${containerClass}`} style={containerStyle}>
          <PDFViewer {...viewerProps} />
        </div>
      )

    case 'word':
      return (
        <div className={`rounded-lg overflow-hidden ${containerClass}`} style={containerStyle}>
          <WordViewer {...viewerProps} />
        </div>
      )

    case 'text':
    case 'sql':
      return (
        <div className={`rounded-lg overflow-hidden ${containerClass}`} style={containerStyle}>
          <TextViewer {...viewerProps} />
        </div>
      )

    default:
      return (
        <div
          className={`flex items-center justify-center w-full rounded-lg border border-gray-200 bg-gray-50 ${containerClass}`}
          style={containerStyle}
        >
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Tipo de archivo no soportado</p>
            <p className="text-gray-400 text-xs mt-1">{fileMetadata.extension}</p>
          </div>
        </div>
      )
  }
}

export type { FileViewerProps }
export { createFileMetadata, isSupportedFileType }
