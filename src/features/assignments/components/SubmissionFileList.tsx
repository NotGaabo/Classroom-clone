'use client'

import { useState } from 'react'
import { FileViewer } from '@/components/common/FileViewer'
import { SubmissionAttachment } from '@/types/assignments'

interface SubmissionFileListProps {
  files: SubmissionAttachment[]
}

export function SubmissionFileList({ files }: SubmissionFileListProps) {
  const [selectedFile, setSelectedFile] = useState<SubmissionAttachment | null>(null)
  const [viewerError, setViewerError] = useState<string | null>(null)

  if (files.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        Sin archivos adjuntos en esta entrega.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {file.extension.toUpperCase()} • {file.size ? `${Math.round(file.size / 1024)} KB` : 'Archivo'}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewerError(null)
                  setSelectedFile(file)
                }}
                className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-200"
              >
                Ver
              </button>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Abrir
              </a>
            </div>
          </div>
        ))}
      </div>

      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-900">{selectedFile.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedFile.extension.toUpperCase()} • {selectedFile.mimeType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Abrir aparte
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {viewerError && (
              <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
                {viewerError}
              </div>
            )}

            <div className="flex-1 overflow-hidden bg-slate-100 p-4">
              <FileViewer
                file={selectedFile}
                height="100%"
                onError={(error) => setViewerError(error.message)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
