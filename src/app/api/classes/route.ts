import { NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/server/api/response'
import { toApiErrorResponse } from '@/server/api/errors'
import { createManagedClass, listVisibleClasses } from '@/server/services/classes.service'

export async function GET() {
  try {
    const classes = await listVisibleClasses()
    return apiSuccess(classes)
  } catch (error) {
    console.error('Server error:', error)
    return toApiErrorResponse(error, 'No se pudieron cargar las clases')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || name.trim().length === 0) {
      return apiError(
        { code: 'VALIDATION_ERROR', message: 'El nombre de la clase es requerido' },
        { status: 400 }
      )
    }

    const createdClass = await createManagedClass({
      name,
      description,
    })

    return apiSuccess(createdClass, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return toApiErrorResponse(error, 'Error al crear la clase')
  }
}
