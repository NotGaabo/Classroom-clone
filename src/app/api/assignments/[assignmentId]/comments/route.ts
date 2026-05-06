import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CommentRow {
  id: string
  assignment_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: {
    full_name?: string | null
  } | null
}

async function getAssignmentAccess(
  assignmentId: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('id, class_id')
    .eq('id', assignmentId)
    .single()

  if (assignmentError || !assignment) {
    return { error: 'Asignación no encontrada', status: 404 as const }
  }

  const { data: membership, error: membershipError } = await supabase
    .from('class_members')
    .select('role')
    .eq('class_id', assignment.class_id)
    .eq('user_id', userId)
    .single()

  if (membershipError || !membership) {
    return { error: 'No tienes acceso a esta asignación', status: 403 as const }
  }

  return { assignment }
}

/* ======================
   GET COMMENTS
====================== */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const access = await getAssignmentAccess(assignmentId, user.id, supabase)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const { data: comments, error } = await supabase
      .from('assignment_comments')
      .select(`
        id,
        assignment_id,
        user_id,
        content,
        created_at,
        profiles:user_id (
          full_name
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Error al cargar comentarios' },
        { status: 500 }
      )
    }

    const formattedComments = (comments as CommentRow[] | null)?.map((comment) => ({
      id: comment.id,
      assignment_id: comment.assignment_id,
      user_id: comment.user_id,
      user_name: comment.profiles?.full_name ?? 'Usuario',
      content: comment.content,
      created_at: comment.created_at
    })) ?? []

    return NextResponse.json(formattedComments)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
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
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'El contenido del comentario es requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const access = await getAssignmentAccess(assignmentId, user.id, supabase)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const { data: newComment, error } = await supabase
      .from('assignment_comments')
      .insert([
        {
          assignment_id: assignmentId,
          user_id: user.id,
          content: content.trim()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Error al crear el comentario' },
        { status: 500 }
      )
    }

    return NextResponse.json(newComment, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
