// types/file.ts

export type FileType = 
  | 'image' 
  | 'pdf' 
  | 'video'
  | 'word' 
  | 'text' 
  | 'sql'
  | 'unknown'

export type FilePreviewType =
  | 'code'
  | 'image'
  | 'markdown'
  | 'pdf'
  | 'sql'
  | 'text'
  | 'unknown'
  | 'video'
  | 'word'

export interface FileMetadata {
  name: string
  type: FileType
  mimeType: string
  extension: string
  url: string
  previewType?: FilePreviewType
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
  video: ['mp4', 'mov', 'webm', 'avi', 'm4v'],
  word: ['doc', 'docx', 'ppt', 'pptx'],
  text: ['txt', 'text', 'md', 'csv', 'json'],
  sql: ['sql'],
} as const

export const MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
  word: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  text: ['text/plain', 'text/markdown', 'application/json', 'text/csv'],
  sql: ['application/sql', 'text/sql'],
} as const
