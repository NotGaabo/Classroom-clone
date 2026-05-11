import { NextRequest } from 'next/server'
import { apiSuccess } from '@/server/api/response'
import { toApiErrorResponse } from '@/server/api/errors'
import { deleteManagedClass, getClassDetail } from '@/server/services/classes.service'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params
    const classData = await getClassDetail(classId)
    return apiSuccess(classData)
  } catch (error) {
    console.error('Server error:', error)
    return toApiErrorResponse(error, 'No se pudo cargar la clase')
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classId } = await params
    await deleteManagedClass(classId)
    return apiSuccess({ deleted: true, id: classId })
  } catch (error) {
    console.error('Server error:', error)
    return toApiErrorResponse(error, 'No se pudo eliminar la clase')
  }
}
