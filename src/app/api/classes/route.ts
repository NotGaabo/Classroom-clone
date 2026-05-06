import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        description,
        code,
        created_at,
        class_members!inner (
          role,
          user_id,
          profiles (
            full_name
          )
        )
      `)
      .eq('class_members.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching classes:', error)
      return NextResponse.json(
        { error: 'No se pudieron cargar las clases' },
        { status: 500 }
      )
    }

    return NextResponse.json(classes || [])
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
    const { name, description } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre de la clase es requerido' },
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile role:', profileError)
      return NextResponse.json(
        { error: 'No se pudo verificar tu perfil' },
        { status: 500 }
      )
    }

    if (profile.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Solo los profesores pueden crear clases' },
        { status: 403 }
      )
    }

    const { data: newClass, error: classError } = await supabase.rpc('create_classroom', {
      input_name: name.trim(),
      input_description: description?.trim() || null
    })

    if (classError || !newClass) {
      console.error('Error creating class via RPC:', classError)
      return NextResponse.json(
        { error: 'Error al crear la clase' },
        { status: 500 }
      )
    }

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
