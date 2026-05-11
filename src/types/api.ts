export interface ApiErrorPayload {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponseMetadata {
  pagination?: {
    page: number
    pageSize: number
    total: number
  }
  requestId?: string
  revalidated?: string[]
  timestamp: string
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  error: null
  metadata: ApiResponseMetadata
}

export interface ApiErrorResponse {
  success: false
  data: null
  error: ApiErrorPayload
  metadata: ApiResponseMetadata
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
