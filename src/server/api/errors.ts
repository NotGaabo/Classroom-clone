import { apiError } from '@/server/api/response'

export function toApiErrorResponse(error: unknown, fallbackMessage = 'Error interno del servidor') {
  if (error instanceof Error) {
    if (error.name === 'AUTH_REQUIRED') {
      return apiError({ code: 'AUTH_REQUIRED', message: 'No autenticado' }, { status: 401 })
    }

    if (error.name === 'NOT_FOUND') {
      return apiError({ code: 'NOT_FOUND', message: error.message || 'Recurso no encontrado' }, { status: 404 })
    }

    if (error.name === 'VALIDATION_ERROR') {
      return apiError({ code: 'VALIDATION_ERROR', message: error.message || 'Solicitud inválida' }, { status: 400 })
    }

    if (error.name === 'ROLE_REQUIRED' || error.name === 'FORBIDDEN') {
      return apiError({ code: 'FORBIDDEN', message: error.message || 'No autorizado' }, { status: 403 })
    }

    if (error.name === 'CLASS_MEMBERSHIP_REQUIRED' || error.name === 'CLASS_OWNER_REQUIRED') {
      return apiError({ code: 'CLASS_ACCESS_DENIED', message: error.message }, { status: 403 })
    }

    return apiError(
      {
        code: 'INTERNAL_ERROR',
        message: fallbackMessage,
        details: error.message,
      },
      { status: 500 }
    )
  }

  return apiError({ code: 'INTERNAL_ERROR', message: fallbackMessage }, { status: 500 })
}
