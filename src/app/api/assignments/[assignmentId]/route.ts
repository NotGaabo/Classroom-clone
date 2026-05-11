// app/api/assignments/[assignmentId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeSupabaseError } from '@/lib/supabase/errors'
import { SubmissionAttachment } from '@/types/assignments'
import type { FileType } from '@/types/file'

type AssignmentRole = 'teacher' | 'student'

interface SubmissionRow {
  id: string
  student_id: string
  student_name: string
  content: string | null
  simulator_module: string | null
  screenshot_path: string | null
  submitted_at: string
}

interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
}

interface GradeRow {
  submission_id: string
  score: number | null
  feedback: string | null
  graded_at: string | null
  teacher_id: string | null
}

interface AssignmentFileRow {
  id: string
  bucket_id: string | null
  file_name: string
  file_path: string
  mime_type: string | null
  file_size: number | null
  extension: string | null
  created_at: string
  profiles?: {
    full_name?: string | null
    email?: string | null
  } | null
}

interface SubmissionFileRow {
  id: string
  submission_id: string
  bucket_id: string | null
  file_name: string
  file_path: string
  mime_type: string | null
  file_size: number | null
  extension: string | null
  created_at: string
}

function getFileType(extension: string, mimeType: string | null): FileType {
  const normalizedExtension = extension.toLowerCase()
  const normalizedMime = (mimeType ?? '').toLowerCase()

  if (
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(normalizedExtension) ||
    normalizedMime.startsWith('image/')
  ) {
    return 'image'
  }

  if (normalizedExtension === 'pdf' || normalizedMime === 'application/pdf') {
    return 'pdf'
  }

  if (
    ['doc', 'docx'].includes(normalizedExtension) ||
    [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(normalizedMime)
  ) {
    return 'word'
  }

  if (
    ['ppt', 'pptx'].includes(normalizedExtension) ||
    [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ].includes(normalizedMime)
  ) {
    return 'word'
  }

  if (normalizedExtension === 'sql' || normalizedMime.includes('sql')) {
    return 'sql'
  }

  if (
    ['mp4', 'mov', 'webm', 'avi', 'm4v'].includes(normalizedExtension) ||
    normalizedMime.startsWith('video/')
  ) {
    return 'video'
  }

  if (
    ['txt', 'text', 'md', 'csv', 'json'].includes(normalizedExtension) ||
    normalizedMime.startsWith('text/')
  ) {
    return 'text'
  }

  return 'unknown'
}

function normalizeDisplayName(rawValue: string) {
  const cleanValue = rawValue
    .replace(/[@].*$/, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanValue) {
    return ''
  }

  return cleanValue
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function getExtensionFromPath(path: string) {
  const lastSegment = path.split('/').pop() ?? ''
  return lastSegment.includes('.') ? lastSegment.split('.').pop()?.toLowerCase() ?? '' : ''
}

async function buildSignedSubmissionFiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: SubmissionFileRow[]
) {
  const files = await Promise.all(
    rows.map(async (file) => {
      const bucketId = file.bucket_id ?? 'assignment-submissions'
      const extension = (file.extension ?? '').toLowerCase()
      const mimeType = file.mime_type ?? 'application/octet-stream'

      const { data: signed, error: signedError } = await supabase
        .storage
        .from(bucketId)
        .createSignedUrl(file.file_path, 60 * 60)

      if (signedError) {
        console.error('Signed URL error for submission attachment:', signedError)
      }

      return {
        id: file.id,
        submission_id: file.submission_id,
        name: file.file_name,
        type: getFileType(extension, mimeType),
        mimeType,
        extension,
        url: signed?.signedUrl ?? '',
        size: file.file_size ?? undefined,
        uploadedBy: 'Estudiante',
        uploadedAt: file.created_at,
      } satisfies SubmissionAttachment
    })
  )

  return files.reduce<Map<string, SubmissionAttachment[]>>((map, file) => {
    const current = map.get(file.submission_id ?? '') ?? []
    current.push(file)
    map.set(file.submission_id ?? '', current)
    return map
  }, new Map<string, SubmissionAttachment[]>())
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await context.params

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { data: assignment, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single()

    if (error || !assignment) {
      console.error('Error fetching assignment:', error)
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      )
    }

    const { data: membership, error: membershipError } = await supabase
      .from('class_members')
      .select('role')
      .eq('class_id', assignment.class_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta asignación' },
        { status: 403 }
      )
    }

    const role = membership.role as AssignmentRole

    const { data: ownSubmission, error: ownSubmissionError } = await supabase
      .from('assignment_submissions')
      .select('id, student_id, student_name, content, simulator_module, screenshot_path, submitted_at')
      .eq('assignment_id', assignmentId)
      .eq('student_id', user.id)
      .maybeSingle()

    if (ownSubmissionError) {
      console.error('Error fetching own submission:', ownSubmissionError)
    }

    let ownGradeScore: number | null = null
    let ownGradeFeedback: string | null = null
    let ownGradeAt: string | null = null
    if (ownSubmission?.id) {
      const { data: ownGrade, error: ownGradeError } = await supabase
        .from('assignment_submissions_grades')
        .select('score, feedback, graded_at')
        .eq('submission_id', ownSubmission.id)
        .maybeSingle()

      if (ownGradeError) {
        console.error('Error fetching own grade:', ownGradeError)
      } else {
        ownGradeScore = ownGrade?.score ?? null
        ownGradeFeedback = ownGrade?.feedback ?? null
        ownGradeAt = ownGrade?.graded_at ?? null
      }
    }

    let submissions: Array<{
      id: string
      student_id: string
      student_name: string
      content: string | null
      simulator_module: string | null
      screenshot_path: string | null
      screenshot_url?: string | null
      submitted_at: string
      score?: number | null
      feedback?: string | null
      graded_at?: string | null
      graded_by?: string | null
      files?: SubmissionAttachment[]
    }> = []

    if (role === 'teacher') {
      const { data: rows, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('id, student_id, student_name, content, simulator_module, screenshot_path, submitted_at')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError)
      } else if (rows) {
        const submissionRows = rows as SubmissionRow[]
        const studentIds = submissionRows.map((row) => row.student_id)
        const submissionIds = submissionRows.map((row) => row.id)
        const profilesMap = new Map<string, { full_name?: string | null; email?: string | null }>()
        const gradesMap = new Map<string, GradeRow>()

        if (studentIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', studentIds)

          if (profilesError) {
            console.error('Profiles lookup error:', profilesError)
          } else if (profiles) {
            ;(profiles as ProfileRow[]).forEach((profile) => {
              profilesMap.set(profile.id, {
                full_name: profile.full_name,
                email: profile.email,
              })
            })
          }
        }

        if (submissionIds.length > 0) {
          const { data: grades, error: gradesError } = await supabase
            .from('assignment_submissions_grades')
            .select('submission_id, score, feedback, graded_at, teacher_id')
            .in('submission_id', submissionIds)

          if (gradesError) {
            console.error('Grades lookup error:', gradesError)
          } else if (grades) {
            ;(grades as GradeRow[]).forEach((grade) => {
              gradesMap.set(grade.submission_id, grade)
            })
          }
        }

        const { data: submissionFileRows, error: submissionFilesError } = await supabase
          .from('assignment_submission_files')
          .select('id, submission_id, bucket_id, file_name, file_path, mime_type, file_size, extension, created_at')
          .in('submission_id', submissionIds)
          .order('created_at', { ascending: true })

        if (submissionFilesError) {
          console.error('Submission files lookup error:', submissionFilesError)
        }

        const submissionFilesMap = await buildSignedSubmissionFiles(
          supabase,
          (submissionFileRows as SubmissionFileRow[] | null) ?? []
        )

        submissions = await Promise.all(
          submissionRows.map(async (row) => {
            let signedUrl: string | null = null

            if (row.screenshot_path) {
              const { data: signed, error: signedError } = await supabase
                .storage
                .from('assignment-submissions')
                .createSignedUrl(row.screenshot_path, 60 * 60)

              if (signedError) {
                console.error('Signed URL error:', signedError)
              }

              signedUrl = signed?.signedUrl ?? null
            }

            const profile = profilesMap.get(row.student_id)
            const rawName =
              profile?.full_name?.trim() ||
              row.student_name?.trim() ||
              profile?.email?.trim() ||
              'Estudiante'
            const studentName = rawName.includes('@')
              ? normalizeDisplayName(rawName) || 'Estudiante'
              : rawName
            const grade = gradesMap.get(row.id)
            const attachedFiles = submissionFilesMap.get(row.id) ?? []

            if (attachedFiles.length === 0 && signedUrl) {
              attachedFiles.push({
                id: `${row.id}-legacy-preview`,
                submission_id: row.id,
                name: row.screenshot_path?.split('/').pop() ?? 'archivo-entregado',
                type: getFileType(getExtensionFromPath(row.screenshot_path ?? ''), null),
                mimeType: 'application/octet-stream',
                extension: getExtensionFromPath(row.screenshot_path ?? ''),
                url: signedUrl,
                uploadedBy: studentName,
                uploadedAt: row.submitted_at,
              })
            }

            return {
              ...row,
              student_name: studentName,
              screenshot_url: signedUrl,
              score: grade?.score ?? null,
              feedback: grade?.feedback ?? null,
              graded_at: grade?.graded_at ?? null,
              graded_by: grade?.teacher_id ?? null,
              files: attachedFiles,
            }
          })
        )
      }
    }

    let ownSubmissionFiles: SubmissionAttachment[] = []
    if (ownSubmission?.id) {
      const { data: ownSubmissionFileRows, error: ownSubmissionFilesError } = await supabase
        .from('assignment_submission_files')
        .select('id, submission_id, bucket_id, file_name, file_path, mime_type, file_size, extension, created_at')
        .eq('submission_id', ownSubmission.id)
        .order('created_at', { ascending: true })

      if (ownSubmissionFilesError) {
        console.error('Own submission files lookup error:', ownSubmissionFilesError)
      } else {
        const submissionFilesMap = await buildSignedSubmissionFiles(
          supabase,
          (ownSubmissionFileRows as SubmissionFileRow[] | null) ?? []
        )
        ownSubmissionFiles = submissionFilesMap.get(ownSubmission.id) ?? []
      }

      if (ownSubmissionFiles.length === 0 && ownSubmission.screenshot_path) {
        const { data: signed, error: signedError } = await supabase
          .storage
          .from('assignment-submissions')
          .createSignedUrl(ownSubmission.screenshot_path, 60 * 60)

        if (signedError) {
          console.error('Legacy own submission signed URL error:', signedError)
        } else if (signed?.signedUrl) {
          ownSubmissionFiles = [
            {
              id: `${ownSubmission.id}-legacy-preview`,
              submission_id: ownSubmission.id,
              name: ownSubmission.screenshot_path.split('/').pop() ?? 'archivo-entregado',
              type: getFileType(getExtensionFromPath(ownSubmission.screenshot_path), null),
              mimeType: 'application/octet-stream',
              extension: getExtensionFromPath(ownSubmission.screenshot_path),
              url: signed.signedUrl,
              uploadedBy: 'Estudiante',
              uploadedAt: ownSubmission.submitted_at,
            },
          ]
        }
      }
    }

    const { data: fileRows, error: filesError } = await supabase
      .from('assignment_files')
      .select(`
        id,
        bucket_id,
        file_name,
        file_path,
        mime_type,
        file_size,
        extension,
        created_at,
        profiles:uploaded_by (
          full_name,
          email
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true })

    if (filesError) {
      console.error('Error fetching assignment files:', filesError)
    }

    const files = await Promise.all(
      ((fileRows as AssignmentFileRow[] | null) ?? []).map(async (file) => {
        const bucketId = file.bucket_id ?? 'assignment-files'
        const extension = (file.extension ?? '').toLowerCase()
        const mimeType = file.mime_type ?? 'application/octet-stream'

        const { data: signed, error: signedError } = await supabase
          .storage
          .from(bucketId)
          .createSignedUrl(file.file_path, 60 * 60)

        if (signedError) {
          console.error('Signed URL error for attachment:', signedError)
        }

        return {
          id: file.id,
          name: file.file_name,
          type: getFileType(extension, mimeType),
          mimeType,
          extension,
          url: signed?.signedUrl ?? '',
          size: file.file_size ?? undefined,
          uploadedBy:
            file.profiles?.full_name?.trim() ||
            file.profiles?.email?.trim() ||
            'Profesor',
          uploadedAt: file.created_at,
        }
      })
    )

    const status =
      ownGradeScore !== null
        ? 'graded'
        : ownSubmission
          ? 'submitted'
          : 'not_submitted'

    return NextResponse.json({
      ...assignment,
      my_role: role,
      score: ownGradeScore,
      feedback: ownGradeFeedback,
      graded_at: ownGradeAt,
      status,
      own_submission: ownSubmission
        ? {
            ...ownSubmission,
            score: ownGradeScore,
            feedback: ownGradeFeedback,
            graded_at: ownGradeAt,
            files: ownSubmissionFiles,
          }
        : null,
      submissions,
      files,
    })
  } catch (error) {
    const normalizedError = normalizeSupabaseError(
      error,
      'No se pudo cargar la asignación porque Supabase no respondió.'
    )

    console.error('Server error:', normalizedError)

    if (normalizedError.name === 'SERVICE_UNAVAILABLE') {
      return NextResponse.json(
        {
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: normalizedError.message,
          },
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      },
      { status: 500 }
    )
  }
}
