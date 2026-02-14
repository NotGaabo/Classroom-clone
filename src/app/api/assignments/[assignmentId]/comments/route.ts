// app/api/assignments/[assignmentId]/comments/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
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
      .eq('assignment_id', params.assignmentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Error al cargar comentarios' },
        { status: 500 }
      )
    }

    // Formatear la respuesta para incluir el nombre del usuario
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      assignment_id: comment.assignment_id,
      user_id: comment.user_id,
      user_name: 'Usuario',
      content: comment.content,
      created_at: comment.created_at
    }))

    return NextResponse.json(formattedComments)
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
  { params }: { params: { assignmentId: string } }
) {
  try {
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
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { data: newComment, error: commentError } = await supabase
      .from('assignment_comments')
      .insert([
        {
          assignment_id: params.assignmentId,
          user_id: user.id,
          content: content.trim()
        }
      ])
      .select()
      .single()

    if (commentError) {
      console.error('Error creating comment:', commentError)
      return NextResponse.json(
        { error: 'Error al crear el comentario' },
        { status: 500 }
      )
    }

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}