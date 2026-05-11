import { NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/server/api/response'
import { toApiErrorResponse } from '@/server/api/errors'
import { createManagedAssignment, listManagedAssignments } from '@/server/services/assignments.service'

export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('class_id')

    if (!classId) {
      return apiError(
        { code: 'VALIDATION_ERROR', message: 'class_id es requerido' },
        { status: 400 }
      )
    }

    const assignments = await listManagedAssignments(classId)
    return apiSuccess(assignments)
  } catch (error) {
    console.error('Assignments list failed:', error)
    return toApiErrorResponse(error, 'No se pudieron cargar las asignaciones')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      class_id?: string
      description?: string | null
      due_date?: string | null
      points?: number | null
      title?: string
    }

    if (!body.class_id || typeof body.class_id !== 'string') {
      return apiError(
        { code: 'VALIDATION_ERROR', message: 'class_id es requerido' },
        { status: 400 }
      )
    }

    if (!body.title || typeof body.title !== 'string') {
      return apiError(
        { code: 'VALIDATION_ERROR', message: 'El título de la asignación es requerido' },
        { status: 400 }
      )
    }

    const assignment = await createManagedAssignment({
      class_id: body.class_id,
      title: body.title,
      description: body.description ?? null,
      due_date: body.due_date ?? null,
      points: body.points ?? null,
    })

    return apiSuccess(assignment, { status: 201 })
  } catch (error) {
    console.error('Assignment creation failed:', error)
    return toApiErrorResponse(error, 'No se pudo crear la asignación')
  }
}
