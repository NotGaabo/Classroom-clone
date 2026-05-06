import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

interface AssignmentAccessResult {
  assignment: {
    id: string
    class_id: string
    points: number | null
  }
  user: {
    id: string
    email?: string | null
  }
}

async function getStudentAssignmentAccess(
  assignmentId: string
): Promise<AssignmentAccessResult | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('id, class_id, points')
    .eq('id', assignmentId)
    .single()

  if (assignmentError || !assignment) {
    return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 })
  }

  const { data: membership, error: membershipError } = await supabase
    .from('class_members')
    .select('role')
    .eq('class_id', assignment.class_id)
    .eq('user_id', user.id)
    .single()

  if (membershipError || !membership || membership.role !== 'student') {
    return NextResponse.json(
      { error: 'Solo los estudiantes pueden entregar esta asignación' },
      { status: 403 }
    )
  }

  return {
    assignment,
    user,
  }
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const { assignmentId } = await params
  const access = await getStudentAssignmentAccess(assignmentId)

  if (access instanceof NextResponse) {
    return access
  }

  const supabase = await createClient()
  const formData = await request.formData()
  const contentValue = formData.get('content')
  const content = typeof contentValue === 'string' ? contentValue.trim() : ''
  const files = formData
    .getAll('files')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  const { assignment, user } = access

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const displayName =
    profile?.full_name?.trim() ||
    profile?.email?.trim() ||
    user.email?.trim() ||
    'Estudiante'

  const { data: existingSubmission, error: existingSubmissionError } = await supabase
    .from('assignment_submissions')
    .select('id, screenshot_path')
    .eq('assignment_id', assignmentId)
    .eq('student_id', user.id)
    .maybeSingle()

  if (existingSubmissionError) {
    console.error('Error fetching existing submission:', existingSubmissionError)
    return NextResponse.json(
      { error: 'No se pudo preparar la entrega' },
      { status: 500 }
    )
  }

  const hasExistingSubmission = Boolean(existingSubmission?.id)
  const replaceExistingFiles = files.length > 0

  if (!content && files.length === 0 && !hasExistingSubmission) {
    return NextResponse.json(
      { error: 'Agrega un comentario o al menos un archivo para entregar' },
      { status: 400 }
    )
  }

  const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE_BYTES)
  if (oversizedFile) {
    return NextResponse.json(
      { error: `El archivo ${oversizedFile.name} supera el límite de 25 MB` },
      { status: 400 }
    )
  }

  let submissionId = existingSubmission?.id ?? null

  if (!submissionId) {
    const { data: newSubmission, error: insertSubmissionError } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.id,
        student_name: displayName,
        content: content || null,
        screenshot_path: null,
        screenshot_url: null,
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertSubmissionError || !newSubmission) {
      console.error('Error creating submission:', insertSubmissionError)
      return NextResponse.json(
        { error: 'No se pudo registrar la entrega' },
        { status: 500 }
      )
    }

    submissionId = newSubmission.id
  } else {
    const { error: updateSubmissionError } = await supabase
      .from('assignment_submissions')
      .update({
        student_name: displayName,
        content: content || null,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    if (updateSubmissionError) {
      console.error('Error updating submission:', updateSubmissionError)
      return NextResponse.json(
        { error: 'No se pudo actualizar la entrega' },
        { status: 500 }
      )
    }
  }

  if (replaceExistingFiles) {
    const { data: previousFiles, error: previousFilesError } = await supabase
      .from('assignment_submission_files')
      .select('id, bucket_id, file_path')
      .eq('submission_id', submissionId)

    if (previousFilesError) {
      console.error('Error fetching previous submission files:', previousFilesError)
      return NextResponse.json(
        { error: 'No se pudo reemplazar la entrega anterior' },
        { status: 500 }
      )
    }

    const filesByBucket = ((previousFiles ?? []) as Array<{ id: string; bucket_id: string | null; file_path: string }>)
      .reduce<Record<string, string[]>>((groups, file) => {
        const bucketId = file.bucket_id ?? 'assignment-submissions'
        groups[bucketId] ??= []
        groups[bucketId].push(file.file_path)
        return groups
      }, {})

    for (const [bucketId, paths] of Object.entries(filesByBucket)) {
      const { error: removeStorageError } = await supabase.storage.from(bucketId).remove(paths)
      if (removeStorageError) {
        console.error('Error removing previous submission files from storage:', removeStorageError)
        return NextResponse.json(
          { error: 'No se pudieron reemplazar los archivos anteriores' },
          { status: 500 }
        )
      }
    }

    if ((previousFiles ?? []).length > 0) {
      const { error: deletePreviousRowsError } = await supabase
        .from('assignment_submission_files')
        .delete()
        .eq('submission_id', submissionId)

      if (deletePreviousRowsError) {
        console.error('Error deleting previous submission files rows:', deletePreviousRowsError)
        return NextResponse.json(
          { error: 'No se pudieron actualizar los archivos de la entrega' },
          { status: 500 }
        )
      }
    }

    const uploadedRows: Array<{
      submission_id: string
      assignment_id: string
      student_id: string
      bucket_id: string
      file_name: string
      file_path: string
      mime_type: string
      file_size: number
      extension: string
    }> = []

    for (const file of files) {
      const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? '' : ''
      const safeFileName = sanitizeFileName(file.name || 'archivo')
      const filePath = `${assignmentId}/${user.id}/${submissionId}/${Date.now()}-${safeFileName}`
      const fileBuffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabase
        .storage
        .from('assignment-submissions')
        .upload(filePath, fileBuffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading submission file:', uploadError)
        return NextResponse.json(
          { error: `No se pudo subir ${file.name}` },
          { status: 500 }
        )
      }

      uploadedRows.push({
        submission_id: submissionId,
        assignment_id: assignment.id,
        student_id: user.id,
        bucket_id: 'assignment-submissions',
        file_name: file.name,
        file_path: filePath,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        extension,
      })
    }

    if (uploadedRows.length > 0) {
      const { error: insertFilesError } = await supabase
        .from('assignment_submission_files')
        .insert(uploadedRows)

      if (insertFilesError) {
        console.error('Error storing submission files metadata:', insertFilesError)
        return NextResponse.json(
          { error: 'No se pudieron guardar los archivos de la entrega' },
          { status: 500 }
        )
      }
    }

    const { error: updatePreviewError } = await supabase
      .from('assignment_submissions')
      .update({
        screenshot_path: uploadedRows[0]?.file_path ?? null,
        screenshot_url: null,
      })
      .eq('id', submissionId)

    if (updatePreviewError) {
      console.error('Error updating submission preview path:', updatePreviewError)
    }
  }

  return NextResponse.json(
    {
      success: true,
      submission_id: submissionId,
      replaced_files: replaceExistingFiles,
    },
    { status: 200 }
  )
}
