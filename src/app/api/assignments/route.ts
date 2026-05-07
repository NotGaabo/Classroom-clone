// src/app/api/assignments/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type AssignmentRole = 'teacher' | 'student'

export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('class_id')

    if (!classId) {
      return NextResponse.json(
        { error: 'class_id es requerido' },
        { status: 400 }
      )
    }

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

    const { data: membership, error: membershipError } = await supabase
      .from('enrollments')
      .select('role')
      .eq('class_id', classId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'No perteneces a esta clase' },
        { status: 403 }
      )
    }

    const role = membership.role as AssignmentRole

    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        id,
        class_id,
        title,
        description,
        points,
        due_date,
        created_at,
        simulator_module
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json(
        { error: 'No se pudieron cargar las asignaciones' },
        { status: 500 }
      )
    }

    if (!assignments || assignments.length === 0) {
      return NextResponse.json([])
    }

    const assignmentIds = assignments.map((assignment) => assignment.id)
    const submittedSet = new Set<string>()
    const gradesMap = new Map<string, number | null>()

    const submissionsQuery = supabase
      .from('assignment_submissions')
      .select('id, assignment_id')
      .in('assignment_id', assignmentIds)

    if (role === 'student') {
      submissionsQuery.eq('student_id', user.id)
    }

    const { data: submissions, error: submissionsError } = await submissionsQuery

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
    } else if (submissions) {
      submissions.forEach((submission) => {
        submittedSet.add(submission.assignment_id)
      })

      const submissionIds = submissions.map((submission) => submission.id)
      if (submissionIds.length > 0) {
        const { data: grades, error: gradesError } = await supabase
          .from('assignment_submissions_grades')
          .select('submission_id, assignment_id, score')
          .in('submission_id', submissionIds)

        if (gradesError) {
          console.error('Error fetching grades:', gradesError)
        } else if (grades) {
          grades.forEach((grade) => {
            gradesMap.set(grade.assignment_id, grade.score)
          })
        }
      }
    }

    return NextResponse.json(
      assignments.map((assignment) => {
        const score = gradesMap.get(assignment.id) ?? null
        const isSubmitted = submittedSet.has(assignment.id)

        return {
          ...assignment,
          my_role: role,
          score: role === 'student' ? score : null,
          status: gradesMap.has(assignment.id)
            ? 'graded'
            : isSubmitted
              ? 'submitted'
              : 'not_submitted',
        }
      })
    )
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { class_id, title, description, due_date, points } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'El título de la asignación es requerido' },
        { status: 400 }
      )
    }

    if (due_date) {
      const parsedDueDate = new Date(due_date)
      if (Number.isNaN(parsedDueDate.getTime())) {
        return NextResponse.json(
          { error: 'La fecha de entrega no es válida' },
          { status: 400 }
        )
      }
    }

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

    const { data: membership, error: membershipError } = await supabase
      .from('enrollments')
      .select('role')
      .eq('class_id', class_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership || membership.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Solo los profesores pueden crear asignaciones' },
        { status: 403 }
      )
    }

    const { data: newAssignment, error: assignmentsError } = await supabase
      .from('assignments')
      .insert([
        {
          class_id,
          title: title.trim(),
          description: description?.trim() || null,
          due_date: due_date || null,
          points: typeof points === 'number' && points >= 0 ? points : null,
        },
      ])
      .select()
      .single()

    if (assignmentsError) {
      console.error('Error creating assignment:', assignmentsError)
      return NextResponse.json(
        { error: 'Error al crear la asignación' },
        { status: 500 }
      )
    }

    return NextResponse.json(newAssignment, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
