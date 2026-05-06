// components/common/FileViewer/FileViewerDemo.tsx

/**
 * Este archivo contiene ejemplos de uso del componente FileViewer
 * Muestra cómo integrar la visualización de archivos en diferentes contextos
 */

'use client'

import { useState } from 'react'
import FileViewer from './FileViewer'
import { FileMetadata, FileType } from '@/types/file'

/**
 * Ejemplo básico: Visor de archivo simple
 */
export function BasicFileViewerExample() {
  const fileUrl = 'https://example.com/document.pdf'

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Visor de Archivo Básico</h3>
      <FileViewer file={fileUrl} height="500px" />
    </div>
  )
}

/**
 * Ejemplo: Galería de archivos con múltiples tipos
 */
export function FileGalleryExample() {
  const files: FileMetadata[] = [
    {
      name: 'imagen-proyecto.png',
      type: 'image' as FileType,
      mimeType: 'image/png',
      extension: 'png',
      url: 'https://via.placeholder.com/600x400',
    },
    {
      name: 'reporte.pdf',
      type: 'pdf' as FileType,
      mimeType: 'application/pdf',
      extension: 'pdf',
      url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table.pdf',
    },
    {
      name: 'consulta.sql',
      type: 'sql' as FileType,
      mimeType: 'application/sql',
      extension: 'sql',
      url: 'data:text/sql;base64,U0VMRUNUIGEuaWQsIGEudGl0bGUsIGEuZHVlX2RhdGUgRlJPTSBhc3NpZ25tZW50cyBhIFdIRVJFIGEuY2xhc3NfaWQgPSAkMQ==',
    },
  ]

  const [selectedFileIndex, setSelectedFileIndex] = useState(0)

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold">Galería de Archivos</h3>

      {/* Vista previa del archivo seleccionado */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <FileViewer file={files[selectedFileIndex]} height="500px" />
      </div>

      {/* Selector de archivos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setSelectedFileIndex(index)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedFileIndex === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-medium text-sm truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {file.type.toUpperCase()}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Ejemplo: Integración en página de asignación
 */
export function AssignmentFileViewerExample() {
  const assignmentFiles = [
    {
      name: 'enunciado.pdf',
      type: 'pdf' as FileType,
      mimeType: 'application/pdf',
      extension: 'pdf',
      url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table.pdf',
      uploadedBy: 'Prof. García',
    },
    {
      name: 'template.docx',
      type: 'word' as FileType,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
      url: 'https://example.com/template.docx',
      uploadedBy: 'Prof. García',
    },
    {
      name: 'datos.sql',
      type: 'sql' as FileType,
      mimeType: 'application/sql',
      extension: 'sql',
      url: 'data:text/sql;base64,U0VMRUNUIFRBQkxFU0VNQUdJQ0sK',
      uploadedBy: 'Prof. García',
    },
  ]

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Proyecto Final - Desarrollo Web</h2>
        <p className="text-gray-600 mb-6">
          Descarga los archivos necesarios para completar la asignación
        </p>
      </div>

      {/* Archivos de la asignación */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Archivos de la Asignación</h3>

        {assignmentFiles.map((file, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            {/* Encabezado del archivo */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">Subido por {file.uploadedBy}</p>
                </div>
              </div>
              <button
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => window.open(file.url)}
              >
                Descargar
              </button>
            </div>

            {/* Visor del archivo */}
            <div className="bg-gray-50 rounded border border-gray-200">
              <FileViewer file={file} height="300px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Ejemplo: Gestor de archivos con manejo de errores
 */
export function FileManagerExample() {
  const [files] = useState<FileMetadata[]>([
    {
      name: 'Captura-2024.png',
      type: 'image' as FileType,
      mimeType: 'image/png',
      extension: 'png',
      url: 'https://via.placeholder.com/800x600',
    },
  ])

  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(files[0])
  const [error, setError] = useState<string | null>(null)

  const handleFileError = (err: Error) => {
    setError(err.message)
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Panel lateral - Lista de archivos */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="font-semibold text-sm">Archivos</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {files.map((file, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedFile(file)
                setError(null)
              }}
              className={`w-full p-3 rounded border-2 text-left transition-all ${
                selectedFile?.url === file.url
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{file.type}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Panel principal - Visor */}
      <div className="lg:col-span-3 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {selectedFile && (
          <>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{selectedFile.name}</h4>
              <a
                href={selectedFile.url}
                download={selectedFile.name}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Descargar
              </a>
            </div>

            <FileViewer
              file={selectedFile}
              height="500px"
              onError={handleFileError}
            />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Utilidad: Obtener icono según tipo de archivo
 */
function getFileIcon(type: FileType) {
  const iconClasses = 'w-5 h-5'

  switch (type) {
    case 'image':
      return (
        <svg className={`${iconClasses} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'pdf':
      return (
        <svg className={`${iconClasses} text-red-600`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V9z" />
        </svg>
      )
    case 'word':
      return (
        <svg className={`${iconClasses} text-blue-600`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V9z" />
        </svg>
      )
    case 'text':
      return (
        <svg className={`${iconClasses} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'sql':
      return (
        <svg className={`${iconClasses} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7m0 0V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2m0 0h16" />
        </svg>
      )
    default:
      return (
        <svg className={`${iconClasses} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}
