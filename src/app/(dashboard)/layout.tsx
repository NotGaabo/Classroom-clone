import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseNetworkError } from '@/lib/supabase/errors'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (isSupabaseNetworkError(error)) {
      throw error
    }

    if (!user) {
      redirect('/login')
    }

    return <>{children}</>
  } catch (error) {
    if (isSupabaseNetworkError(error)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">Conexión temporalmente no disponible</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              No pudimos validar tu sesión porque Supabase no respondió a tiempo. La app no se cerró:
              vuelve a intentar en unos segundos.
            </p>
          </div>
        </div>
      )
    }

    throw error
  }
}
