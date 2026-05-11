import { NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/server/api/response'
import { toApiErrorResponse } from '@/server/api/errors'
import { createManagedAssignmentComment, listManagedAssignmentComments } from '@/server/services/comments.service'

/* ======================
   GET COMMENTS
====================== */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params
    const comments = await listManagedAssignmentComments(assignmentId)
    return apiSuccess(comments)
  } catch (error) {
    console.error('Comments list failed:', error)
    return toApiErrorResponse(error, 'Error al cargar comentarios')
  }
}


/* ======================
   POST COMMENT
====================== */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params
    const body = (await request.json()) as { content?: string }

    if (!body.content || body.content.trim().length === 0) {
      return apiError(
        { code: 'VALIDATION_ERROR', message: 'El contenido del comentario es requerido' },
        { status: 400 }
      )
    }

    const comment = await createManagedAssignmentComment(assignmentId, body.content)
    return apiSuccess(comment, { status: 201 })
  } catch (error) {
    console.error('Comment creation failed:', error)
    return toApiErrorResponse(error, 'Error al crear el comentario')
  }
}
