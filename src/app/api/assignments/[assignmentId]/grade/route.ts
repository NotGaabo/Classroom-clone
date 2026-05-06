import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const { assignmentId } = await params
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

  if (membershipError || !membership || membership.role !== 'teacher') {
    return NextResponse.json(
      { error: 'Solo el profesor puede calificar esta entrega' },
      { status: 403 }
    )
  }

  const payload = await request.json()
  const submissionId = typeof payload.submissionId === 'string' ? payload.submissionId : ''
  const feedback = typeof payload.feedback === 'string' ? payload.feedback.trim() : ''
  const rawScore = payload.score
  const parsedScore = rawScore === '' || rawScore === null || rawScore === undefined
    ? null
    : Number(rawScore)

  if (!submissionId) {
    return NextResponse.json({ error: 'La entrega es requerida' }, { status: 400 })
  }

  if (parsedScore !== null) {
    if (!Number.isFinite(parsedScore) || parsedScore < 0) {
      return NextResponse.json({ error: 'La nota debe ser un número válido' }, { status: 400 })
    }

    if (assignment.points !== null && parsedScore > assignment.points) {
      return NextResponse.json(
        { error: `La nota no puede superar ${assignment.points} puntos` },
        { status: 400 }
      )
    }
  }

  const { data: submission, error: submissionError } = await supabase
    .from('assignment_submissions')
    .select('id')
    .eq('id', submissionId)
    .eq('assignment_id', assignmentId)
    .single()

  if (submissionError || !submission) {
    return NextResponse.json({ error: 'Entrega no encontrada' }, { status: 404 })
  }

  const gradePayload = {
    submission_id: submissionId,
    assignment_id: assignmentId,
    teacher_id: user.id,
    score: parsedScore,
    feedback: feedback || null,
    graded_at: new Date().toISOString(),
  }

  const { data: existingGrade, error: existingGradeError } = await supabase
    .from('assignment_submissions_grades')
    .select('id')
    .eq('submission_id', submissionId)
    .maybeSingle()

  if (existingGradeError) {
    console.error('Error fetching existing grade:', existingGradeError)
    return NextResponse.json(
      { error: 'No se pudo preparar la calificación' },
      { status: 500 }
    )
  }

  if (existingGrade?.id) {
    const { error: updateGradeError } = await supabase
      .from('assignment_submissions_grades')
      .update(gradePayload)
      .eq('id', existingGrade.id)

    if (updateGradeError) {
      console.error('Error updating grade:', updateGradeError)
      return NextResponse.json({ error: 'No se pudo actualizar la calificación' }, { status: 500 })
    }
  } else {
    const { error: insertGradeError } = await supabase
      .from('assignment_submissions_grades')
      .insert(gradePayload)

    if (insertGradeError) {
      console.error('Error creating grade:', insertGradeError)
      return NextResponse.json({ error: 'No se pudo guardar la calificación' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
