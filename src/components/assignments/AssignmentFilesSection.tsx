// components/assignments/AssignmentFilesSection.tsx

/**
 * Componente que muestra archivos adjuntos a una asignación
 * Integración del FileViewer en el contexto de Classroom Clone
 */

'use client'

import { useState } from 'react'
import { FileViewer } from '@/components/common/FileViewer'
import { FileMetadata, FileType } from '@/types/file'

interface AssignmentFile extends FileMetadata {
  uploadedBy: string
  uploadedAt: string
  size?: number | null
}

interface AssignmentFilesSectionProps {
  assignmentId: string
  files: AssignmentFile[]
  title?: string
  className?: string
}

export default function AssignmentFilesSection({
  assignmentId,
  files,
  title = 'Archivos de la Asignación',
  className = '',
}: AssignmentFilesSectionProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [expandedFile, setExpandedFile] = useState<string | null>(null)
  const [viewerError, setViewerError] = useState<string | null>(null)

  if (!files || files.length === 0) {
    return (
      <div className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)] ${className}`}>
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <svg
            className="mb-3 h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="font-medium text-gray-600">Sin archivos adjuntos</p>
          <p className="mt-1 text-sm text-gray-500">
            El profesor aún no ha compartido archivos para esta asignación
          </p>
        </div>
      </div>
    )
  }

  const selectedFile = files[selectedFileIndex]

  return (
    <section
      className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)] ${className}`}
      data-assignment-id={assignmentId}
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">
          {files.length} {files.length === 1 ? 'archivo' : 'archivos'} disponible
          {files.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="px-6 py-6">
        {expandedFile === null ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
              Archivos
            </p>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <button
                  key={file.url}
                  onClick={() => {
                    setSelectedFileIndex(index)
                    setViewerError(null)
                  }}
                  className={`group w-full rounded-2xl border p-3 text-left transition-all ${
                    selectedFileIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getFileIcon(file.type)}
                    <p className="text-sm font-medium truncate">{file.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    {file.size ? formatFileSize(file.size) : file.extension.toUpperCase()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Subido por{' '}
                    <span className="font-medium">{selectedFile.uploadedBy}</span> •{' '}
                    {formatDate(selectedFile.uploadedAt)}
                  </p>
                </div>
                <a
                  href={selectedFile.url}
                  download={selectedFile.name}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  title="Descargar archivo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Descargar
                </a>
              </div>
            </div>

            {viewerError && (
              <div className="flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-3">
                <svg
                  className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Advertencia al cargar
                  </p>
                  <p className="text-xs text-orange-700 mt-0.5">{viewerError}</p>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <FileViewer
                file={selectedFile}
                height="450px"
                onError={(error) => {
                  setViewerError(error.message)
                  console.error('Error al cargar archivo:', error)
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <div>
                Tipo:{' '}
                <span className="font-semibold text-gray-700">
                  {selectedFile.type.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setExpandedFile(selectedFile.url)}
                className="text-blue-600 hover:text-blue-700 underline"
                title="Expandir a pantalla completa"
              >
                Pantalla completa
              </button>
            </div>
          </div>
        </div>
        ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-5/6 flex flex-col max-w-6xl shadow-2xl">
            {/* Encabezado de vista expandida */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50">
              <h4 className="font-semibold text-gray-900">{selectedFile.name}</h4>
              <button
                onClick={() => setExpandedFile(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Cerrar"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Contenido expandido */}
            <div className="flex-1 overflow-hidden p-4">
              <FileViewer
                file={selectedFile}
                height="100%"
                onError={(error) => {
                  setViewerError(error.message)
                }}
              />
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  )
}

/**
 * Componentes y utilidades auxiliares
 */

function getFileIcon(type: FileType) {
  const iconClasses = 'w-4 h-4 flex-shrink-0'

  switch (type) {
    case 'image':
      return (
        <svg
          className={`${iconClasses} text-purple-600`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    case 'pdf':
      return (
        <svg
          className={`${iconClasses} text-red-600`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V9z" />
        </svg>
      )
    case 'word':
      return (
        <svg
          className={`${iconClasses} text-blue-600`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V9z" />
        </svg>
      )
    case 'text':
    case 'sql':
      return (
        <svg
          className={`${iconClasses} text-gray-600`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )
    default:
      return (
        <svg
          className={`${iconClasses} text-gray-400`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return `hace ${diffMins} min`
      }
      return `hace ${diffHours}h`
    } else if (diffDays === 1) {
      return 'ayer'
    } else if (diffDays < 7) {
      return `hace ${diffDays} días`
    }

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  } catch {
    return 'recientemente'
  }
}
