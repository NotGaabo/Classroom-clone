import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description } = body

  // 1️⃣ Crear clase
  const { data: newClass, error: classError } = await supabase
    .from('classes')
    .insert({
      name,
      description,
    })
    .select()
    .single()

  if (classError) {
    return NextResponse.json({ error: classError.message }, { status: 400 })
  }

  // 2️⃣ Insertar como teacher en class_members
  const { error: memberError } = await supabase
    .from('class_members')
    .insert({
      class_id: newClass.id,
      user_id: user.id,
      role: 'teacher',
    })

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 400 })
  }

  return NextResponse.json(newClass)
}
