import { NextResponse } from 'next/server'
import type { ApiErrorPayload, ApiResponseMetadata } from '@/types/api'

function buildMetadata(overrides: Partial<ApiResponseMetadata> = {}): ApiResponseMetadata {
  return {
    requestId: overrides.requestId ?? crypto.randomUUID(),
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    pagination: overrides.pagination,
    revalidated: overrides.revalidated,
  }
}

export function apiSuccess<T>(
  data: T,
  init?: ResponseInit,
  metadata: Partial<ApiResponseMetadata> = {}
) {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      metadata: buildMetadata(metadata),
    },
    init
  )
}

export function apiError(
  error: ApiErrorPayload,
  init?: ResponseInit,
  metadata: Partial<ApiResponseMetadata> = {}
) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error,
      metadata: buildMetadata(metadata),
    },
    init
  )
}

export function unwrapApiData<T>(payload: { data?: T | null }) {
  return payload.data ?? null
}
