import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseNetworkError } from '@/lib/supabase/errors'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  try {
    const { error } = await supabase.auth.getUser()

    if (isSupabaseNetworkError(error)) {
      console.error('Supabase session refresh skipped because the service is unavailable.', error)
    }
  } catch (error) {
    if (isSupabaseNetworkError(error)) {
      console.error('Supabase session refresh failed with a network error.', error)
      return supabaseResponse
    }

    throw error
  }

  return supabaseResponse
}
