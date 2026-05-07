import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateClassCode } from '@/lib/utils'

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

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        role,
        profiles (
          full_name
        ),
        classes (
          id,
          name,
          description,
          code,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('Error fetching classes:', error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }

    const classes = enrollments?.map(enrollment => ({
      ...enrollment.classes,
      my_role: enrollment.role,
      class_members: [{
        role: enrollment.role,
        profiles: enrollment.profiles
      }]
    })) || []

    return NextResponse.json(classes)
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

    if (profileError || !profile || profile.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Solo los profesores pueden crear clases' },
        { status: 403 }
      )
    }

    // Generate unique class code
    let code = generateClassCode()
    let attempts = 0
    const maxAttempts = 10
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('classes')
        .select('id')
        .eq('code', code)
        .maybeSingle()
      if (!existing) break
      code = generateClassCode()
      attempts++
    }
    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'No se pudo generar un código único para la clase' },
        { status: 500 }
      )
    }

    const { data: newClass, error: classError } = await supabase
      .from('classes')
      .insert([
        {
          teacher_id: user.id,
          name: name.trim(),
          description: description?.trim() || null,
          code: code
        }
      ])
      .select()
      .single()

    if (classError) {
      console.error('Error creating class:', classError)
      return NextResponse.json(
        { error: 'Error al crear la clase' },
        { status: 500 }
      )
    }

    const { error: memberError } = await supabase
      .from('enrollments')
      .insert([
        {
          class_id: newClass.id,
          user_id: user.id,
          role: 'teacher'
        }
      ])

    if (memberError) {
      console.error('Error adding teacher:', memberError)
      await supabase.from('classes').delete().eq('id', newClass.id)
      return NextResponse.json(
        { error: 'Error al configurar la clase' },
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
