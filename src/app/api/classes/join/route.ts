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
    const { data, error } = await supabase.rpc('join_class_by_code', {
      input_code: normalizedCode
    })

    if (error) {
      console.error('Join RPC error:', error)
      return NextResponse.json({ error: 'No se pudo procesar el código de clase' }, { status: 500 })
    }

    const result = typeof data === 'string' ? JSON.parse(data) : data

    if (!result || result.status === 'not_found') {
      return NextResponse.json({ error: 'Código inválido o clase no encontrada' }, { status: 404 })
    }

    if (result.status === 'forbidden') {
      return NextResponse.json({ error: result.message ?? 'Solo los estudiantes pueden unirse a clases' }, { status: 403 })
    }

    if (result.status === 'already_member') {
      return NextResponse.json({ error: 'Ya eres miembro de esta clase' }, { status: 409 })
    }

    if (result.status !== 'joined' || !result.class) {
      return NextResponse.json({ error: 'Error al unirse a la clase' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Te has unido exitosamente',
      class: result.class
    }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
