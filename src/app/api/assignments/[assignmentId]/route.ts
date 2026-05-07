// app/api/assignments/[assignmentId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type AssignmentRole = 'teacher' | 'student'
type FileType = 'image' | 'pdf' | 'word' | 'text' | 'sql' | 'unknown'

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

  if (normalizedExtension === 'sql' || normalizedMime.includes('sql')) {
    return 'sql'
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
      .from('enrollments')
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
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', user.id)
      .maybeSingle()

    if (ownSubmissionError) {
      console.error('Error fetching own submission:', ownSubmissionError)
    }

    let ownGradeScore: number | null = null
    let ownGradeFeedback: string | null = null
    let ownGradeAt: string | null = null
    let ownGradeBy: string | null = null

    if (ownSubmission?.id) {
      const { data: ownGrade, error: ownGradeError } = await supabase
        .from('assignment_submissions_grades')
        .select('score, feedback, graded_at, teacher_id')
        .eq('submission_id', ownSubmission.id)
        .maybeSingle()

      if (ownGradeError) {
        console.error('Error fetching own grade:', ownGradeError)
      } else if (ownGrade) {
        ownGradeScore = ownGrade.score ?? null
        ownGradeFeedback = ownGrade.feedback ?? null
        ownGradeAt = ownGrade.graded_at ?? null
        ownGradeBy = ownGrade.teacher_id ?? null
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

            return {
              ...row,
              student_name: studentName,
              screenshot_url: signedUrl,
              score: grade?.score ?? null,
              feedback: grade?.feedback ?? null,
              graded_at: grade?.graded_at ?? null,
              graded_by: grade?.teacher_id ?? null,
            }
          })
        )
      }
    } else if (role === 'student' && ownSubmission?.id) {
      let signedUrl: string | null = null

      if (ownSubmission.screenshot_path) {
        const { data: signed, error: signedError } = await supabase
          .storage
          .from('assignment-submissions')
          .createSignedUrl(ownSubmission.screenshot_path, 60 * 60)

        if (signedError) {
          console.error('Signed URL error:', signedError)
        }

        signedUrl = signed?.signedUrl ?? null
      }

      submissions = [
        {
          ...ownSubmission,
          student_name: ownSubmission.student_name,
          screenshot_url: signedUrl,
          score: ownGradeScore,
          feedback: ownGradeFeedback,
          graded_at: ownGradeAt,
          graded_by: ownGradeBy,
        },
      ]
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
      role === 'teacher'
        ? submissions.some((submission) => submission.score !== null && submission.score !== undefined)
          ? 'graded'
          : submissions.length > 0
            ? 'submitted'
            : 'not_submitted'
        : ownGradeScore !== null
          ? 'graded'
          : ownSubmission
            ? 'submitted'
            : 'not_submitted'

    return NextResponse.json({
      ...assignment,
      my_role: role,
      score: ownGradeScore,
      status,
      submissions,
      files,
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await context.params
    const { action, content, simulator_module, screenshot_path, submission_id, score, feedback } = await request.json()

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

    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('class_id')
      .eq('id', assignmentId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      )
    }

    const { data: membership, error: membershipError } = await supabase
      .from('enrollments')
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

    if (action === 'submit') {
      if (role !== 'student') {
        return NextResponse.json(
          { error: 'Solo los estudiantes pueden enviar entregas' },
          { status: 403 }
        )
      }

      if (!content && !simulator_module && !screenshot_path) {
        return NextResponse.json(
          { error: 'Debes enviar contenido o un archivo adjunto' },
          { status: 400 }
        )
      }

      const { data: existingSubmission, error: existingError } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .maybeSingle()

      if (existingError) {
        console.error('Error checking existing submission:', existingError)
        return NextResponse.json(
          { error: 'Error interno al procesar la entrega' },
          { status: 500 }
        )
      }

      if (existingSubmission?.id) {
        const { data: updatedSubmission, error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            content: content?.trim() ?? null,
            simulator_module: simulator_module?.trim() ?? null,
            screenshot_path: screenshot_path ?? null,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existingSubmission.id)
          .select()
          .single()

        if (updateError || !updatedSubmission) {
          console.error('Error updating submission:', updateError)
          return NextResponse.json(
            { error: 'No se pudo actualizar la entrega' },
            { status: 500 }
          )
        }

        return NextResponse.json(updatedSubmission, { status: 200 })
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Error fetching student profile:', profileError)
      }

      const studentName =
        profile?.full_name?.trim() ||
        (profile?.email ? normalizeDisplayName(profile.email) : '') ||
        user.email?.trim() ||
        'Estudiante'

      const { data: newSubmission, error: createError } = await supabase
        .from('assignment_submissions')
        .insert([
          {
            assignment_id: assignmentId,
            student_id: user.id,
            student_name: studentName,
            content: content?.trim() ?? null,
            simulator_module: simulator_module?.trim() ?? null,
            screenshot_path: screenshot_path ?? null,
          },
        ])
        .select()
        .single()

      if (createError || !newSubmission) {
        console.error('Error creating submission:', createError)
        return NextResponse.json(
          { error: 'No se pudo guardar la entrega' },
          { status: 500 }
        )
      }

      return NextResponse.json(newSubmission, { status: 201 })
    }

    if (action === 'grade') {
      if (role !== 'teacher') {
        return NextResponse.json(
          { error: 'Solo los profesores pueden calificar entregas' },
          { status: 403 }
        )
      }

      if (!submission_id) {
        return NextResponse.json(
          { error: 'submission_id es requerido para calificar' },
          { status: 400 }
        )
      }

      const parsedScore = typeof score === 'number' ? score : Number(score)
      if (Number.isNaN(parsedScore) || parsedScore < 0) {
        return NextResponse.json(
          { error: 'La calificación debe ser un número válido mayor o igual a 0' },
          { status: 400 }
        )
      }

      const { data: submissionRow, error: submissionError } = await supabase
        .from('assignment_submissions')
        .select('id, assignment_id')
        .eq('id', submission_id)
        .maybeSingle()

      if (submissionError || !submissionRow || submissionRow.assignment_id !== assignmentId) {
        return NextResponse.json(
          { error: 'Entrega no encontrada para esta asignación' },
          { status: 404 }
        )
      }

      const { data: grade, error: gradeError } = await supabase
        .from('assignment_submissions_grades')
        .upsert(
          {
            submission_id,
            score: parsedScore,
            feedback: feedback?.trim() ?? null,
            teacher_id: user.id,
            graded_at: new Date().toISOString(),
          },
          { onConflict: 'submission_id' }
        )
        .select()
        .single()

      if (gradeError || !grade) {
        console.error('Error saving grade:', gradeError)
        return NextResponse.json(
          { error: 'No se pudo guardar la calificación' },
          { status: 500 }
        )
      }

      return NextResponse.json(grade, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
