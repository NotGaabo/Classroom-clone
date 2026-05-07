// app/api/classes/join/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()
    console.log('🔍 Buscando clase con código:', normalizedCode)

    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, name, code')
      .ilike('code', `${normalizedCode}%`)

    console.log('📊 Resultados de búsqueda:', classes?.length || 0, 'clases encontradas')
    classes?.forEach(cls => {
      console.log('   - Código guardado:', `"${cls.code}"`, '-> normalizado:', `"${cls.code?.replace(/\s+/g, '').toUpperCase()}"`)
    })

    if (classesError) {
      console.error('❌ Error finding class by code:', classesError)
      return NextResponse.json({ error: 'Error al buscar la clase' }, { status: 500 })
    }

    const classData = classes?.find((cls: { code?: string }) => {
      const storedCode = cls.code ?? ''
      const normalizedStored = storedCode.replace(/\s+/g, '').toUpperCase()
      const matches = normalizedStored === normalizedCode
      console.log(`   Comparando "${normalizedStored}" === "${normalizedCode}" -> ${matches}`)
      return matches
    })

    console.log('🎯 Clase encontrada:', classData ? `ID: ${classData.id}, Nombre: ${classData.name}` : 'NINGUNA')

    if (!classData) {
      return NextResponse.json({ error: 'Código inválido o clase no encontrada' }, { status: 404 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Solo los estudiantes pueden unirse a clases' }, { status: 403 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('enrollments')
      .select('id')
      .eq('class_id', classData.id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'Ya eres miembro de esta clase' }, { status: 409 })
    }

    // Add user as student
    const { error: joinError } = await supabase
      .from('enrollments')
      .insert({
        class_id: classData.id,
        user_id: user.id,
        role: 'student'
      })

    if (joinError) {
      console.error('Join error:', joinError)
      return NextResponse.json({ error: 'Error al unirse a la clase' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Te has unido exitosamente',
      class: { id: classData.id, name: classData.name }
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
