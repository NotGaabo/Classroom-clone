// app/api/classes/join/route.ts
import { NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/server/api/response'
import { toApiErrorResponse } from '@/server/api/errors'
import { joinManagedClass } from '@/server/services/classes.service'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return apiError({ code: 'VALIDATION_ERROR', message: 'Código requerido' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()
    const result = await joinManagedClass(normalizedCode)

    if (!result || result.status === 'not_found') {
      return apiError(
        { code: 'CLASS_NOT_FOUND', message: 'Código inválido o clase no encontrada' },
        { status: 404 }
      )
    }

    if (result.status === 'forbidden') {
      return apiError(
        {
          code: 'FORBIDDEN',
          message: result.message ?? 'Solo los estudiantes pueden unirse a clases',
        },
        { status: 403 }
      )
    }

    if (result.status === 'already_member') {
      return apiError({ code: 'ALREADY_MEMBER', message: 'Ya eres miembro de esta clase' }, { status: 409 })
    }

    if (result.status !== 'joined' || !result.class) {
      return apiError({ code: 'JOIN_FAILED', message: 'Error al unirse a la clase' }, { status: 500 })
    }

    return apiSuccess(
      {
        message: 'Te has unido exitosamente',
        class: result.class,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return toApiErrorResponse(error, 'Error al unirse a la clase')
  }
}
