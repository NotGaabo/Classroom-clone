// utils/fileDetection.ts

import { FileType, FileMetadata, SUPPORTED_FORMATS, MIME_TYPES } from '@/types/file'

/**
 * Detecta el tipo de archivo basado en la extensión
 */
export function detectFileType(url: string): FileType {
  const extension = getFileExtension(url).toLowerCase()

  // Buscar en SUPPORTED_FORMATS
  for (const [type, extensions] of Object.entries(SUPPORTED_FORMATS)) {
    if (extensions.includes(extension)) {
      return type as FileType
    }
  }

  return 'unknown'
}

/**
 * Obtiene la extensión de un archivo desde una URL
 */
export function getFileExtension(url: string): string {
  try {
    // Remover parámetros de query
    const cleanUrl = url.split('?')[0]
    const parts = cleanUrl.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : ''
  } catch {
    return ''
  }
}

/**
 * Obtiene el nombre del archivo desde una URL
 */
export function getFileName(url: string): string {
  try {
    // Remover parámetros de query
    const cleanUrl = url.split('?')[0]
    const parts = cleanUrl.split('/')
    return parts[parts.length - 1] || 'archivo'
  } catch {
    return 'archivo'
  }
}

/**
 * Obtiene el tipo MIME basado en la extensión
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase()

  for (const [, mimes] of Object.entries(MIME_TYPES)) {
    if (SUPPORTED_FORMATS[ext as keyof typeof SUPPORTED_FORMATS]) {
      return MIME_TYPES[ext as keyof typeof MIME_TYPES][0]
    }
  }

  return 'application/octet-stream'
}

/**
 * Crea metadatos de archivo a partir de una URL
 */
export function createFileMetadata(url: string): FileMetadata {
  const fileName = getFileName(url)
  const extension = getFileExtension(url)
  const fileType = detectFileType(url)

  return {
    name: fileName,
    type: fileType,
    extension: extension,
    mimeType: getMimeType(extension),
    url: url,
  }
}

/**
 * Valida si un tipo de archivo es soportado
 */
export function isSupportedFileType(fileType: FileType): boolean {
  return fileType !== 'unknown'
}

/**
 * Formatea el tamaño de archivo en unidades legibles
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
