import Link from 'next/link'

export default async function ClassLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ classId: string }> | { classId: string }
}) {
  // Next a veces te lo tipa raro si tú lo pones Promise.
  // Aquí lo hacemos compatible con ambos.
  const p: any = params
  const classId = typeof p?.then === 'function' ? (await p).classId : p.classId

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        <div className="rounded-2xl overflow-hidden shadow-sm bg-white">
          {/* Portada */}
          <div className="h-52 bg-gradient-to-br from-slate-700 to-slate-900 p-8 flex flex-col justify-end">
            <h1 className="text-3xl md:text-4xl text-white font-semibold">
              Clase
            </h1>
            <p className="text-white/70 mt-2">ID: {classId}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 px-8 border-b">
            <Tab href={`/classes/${classId}`}>Tablón</Tab>
            <Tab href={`/classes/${classId}/assignments`}>Trabajo</Tab>
            <Tab href={`/classes/${classId}/students`}>Personas</Tab>
            <Tab href={`/classes/${classId}/grades`}>Calificaciones</Tab>
          </div>

          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  // Simple: sin active styling aquí (si quieres active te lo hago con usePathname en client)
  return (
    <Link
      href={href}
      className="py-4 text-gray-600 hover:text-blue-600 font-medium"
    >
      {children}
    </Link>
  )
}
