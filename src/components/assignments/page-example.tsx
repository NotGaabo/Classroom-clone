// app/(dashboard)/classes/[classId]/assignment/[assignmentId]/page-example.tsx

/**
 * EJEMPLO de cómo integrar el FileViewer en una página de asignación
 * Este es un archivo de referencia - adaptar según tu estructura actual
 */

'use client'

import { useState } from 'react'
import AssignmentFilesSection from '@/components/assignments/AssignmentFilesSection'
import { AssignmentAttachment } from '@/types/assignments'

// Datos de ejemplo - reemplazar con datos reales de tu BD
const EXAMPLE_ASSIGNMENT_DATA = {
  id: 'assign-123',
  title: 'Proyecto Final - Aplicación Educativa',
  description: 'Crear una aplicación web educativa con las siguientes funcionalidades...',
  dueDate: '2024-12-20T23:59:59Z',
  points: 100,
  files: [
    {
      name: 'enunciado-proyecto.pdf',
      type: 'pdf' as const,
      mimeType: 'application/pdf',
      extension: 'pdf',
      url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table.pdf',
      uploadedBy: 'Prof. García',
      uploadedAt: '2024-12-01T10:00:00Z',
      size: 2500000,
    },
    {
      name: 'template-base.docx',
      type: 'word' as const,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
      url: 'https://example.com/template.docx',
      uploadedBy: 'Prof. García',
      uploadedAt: '2024-12-01T10:30:00Z',
      size: 500000,
    },
    {
      name: 'base-datos.sql',
      type: 'sql' as const,
      mimeType: 'application/sql',
      extension: 'sql',
      url: 'data:text/sql;base64,Q1JFQVRFIFRBQkxFIGFzc2lnbm1lbnRzICgKICBpZCBVVUlEIFBSSU1BUlkgS0VZLAogIGNsYXNzX2lkIFVVSUQgTk9UIE5VTEwsCiAgdGl0bGUgVkFSQ0hBUigyNTUpIE5PVCBOVUxMLAogIGRlc2NyaXB0aW9uIFRFWFQsCiAgZHVlX2RhdGUgVElNRVNUQU1QIFdJVEggVElNRSBab05FLAogIGNyZWF0ZWRfYXQgVElNRVNUQU1QIFdJVEggVElNRSBab05FIERFRkFVTFQgTk9XLCAKICB1cGRhdGVkX2F0IFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORSBERUZBVUxUIE5PVywKICBGT1JFSUdOIEtFWSAoY2xhc3NfaWQpIFJFRkVSRU5DRVMgY2xhc3NlcyhpZCkKKTs=',
      uploadedBy: 'Prof. García',
      uploadedAt: '2024-12-01T10:45:00Z',
      size: 150000,
    },
    {
      name: 'interfaz-mockup.png',
      type: 'image' as const,
      mimeType: 'image/png',
      extension: 'png',
      url: 'https://via.placeholder.com/1200x800',
      uploadedBy: 'Prof. García',
      uploadedAt: '2024-12-02T14:00:00Z',
      size: 3500000,
    },
  ] as AssignmentAttachment[],
}

export default function AssignmentPageExample() {
  const [submissionStatus] = useState<'not_submitted' | 'submitted' | 'graded'>(
    'not_submitted'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a la clase
          </button>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {EXAMPLE_ASSIGNMENT_DATA.title}
                </h1>
                <p className="text-gray-600 text-sm">
                  Puntos: <span className="font-semibold">{EXAMPLE_ASSIGNMENT_DATA.points}</span>
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  submissionStatus === 'graded'
                    ? 'bg-green-100 text-green-800'
                    : submissionStatus === 'submitted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {submissionStatus === 'graded'
                  ? 'Calificado'
                  : submissionStatus === 'submitted'
                    ? 'Entregado'
                    : 'No entregado'}
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700">
              <p>{EXAMPLE_ASSIGNMENT_DATA.description}</p>
              <p className="text-sm mt-4">
                <strong>Fecha de entrega:</strong>{' '}
                {new Date(EXAMPLE_ASSIGNMENT_DATA.dueDate).toLocaleDateString(
                  'es-ES',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Sección de archivos adjuntos */}
        <div className="mb-8">
          <AssignmentFilesSection
            assignmentId={EXAMPLE_ASSIGNMENT_DATA.id}
            files={EXAMPLE_ASSIGNMENT_DATA.files}
            title="📎 Archivos de la Asignación"
            className="bg-white rounded-lg shadow p-6"
          />
        </div>

        {/* Zona de entrega */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Tu Trabajo</h2>

          {submissionStatus === 'not_submitted' ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600 font-medium mb-2">
                Arrastra tus archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Puedes subir múltiples archivos (máx 100MB por archivo)
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Seleccionar archivo
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ Tu trabajo ha sido entregado
              </p>
              <p className="text-green-700 text-sm mt-1">
                Puedes modificarlo hasta la fecha de entrega
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Notas de implementación:
 *
 * 1. Reemplazar datos de ejemplo con llamadas reales a la API:
 *    const { data: assignment } = await getAssignmentById(assignmentId)
 *
 * 2. Integrar el servicio de subida de archivos para la zona de entrega
 *
 * 3. Conectar con tu sistema de autenticación para mostrar solo archivos permitidos
 *
 * 4. Agregar toasts/notificaciones para feedback del usuario
 *
 * 5. Considerar lazy loading para archivos muy grandes
 *
 * 6. Implementar caché de archivos visualizados recientemente
 */
