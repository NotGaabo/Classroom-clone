// types/file.ts

export type FileType = 
  | 'image' 
  | 'pdf' 
  | 'word' 
  | 'text' 
  | 'sql'
  | 'unknown'

export interface FileMetadata {
  name: string
  type: FileType
  mimeType: string
  extension: string
  url: string
  size?: number | null
}

export interface FileViewerProps {
  file: FileMetadata | string // URL o FileMetadata
  height?: string
  className?: string
  onError?: (error: Error) => void
}

export interface FileViewerState {
  loading: boolean
  error: Error | null
  fileData: FileMetadata | null
}

export const SUPPORTED_FORMATS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  pdf: ['pdf'],
  word: ['doc', 'docx'],
  text: ['txt', 'text'],
  sql: ['sql'],
} as const

export const MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  pdf: ['application/pdf'],
  word: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  text: ['text/plain'],
  sql: ['application/sql', 'text/sql'],
} as const
