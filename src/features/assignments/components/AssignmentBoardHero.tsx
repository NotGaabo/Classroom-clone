interface AssignmentBoardHeroProps {
  classCode?: string | null
  className?: string | null
  submittedCount: number
  totalAssignments: number
}

export function AssignmentBoardHero({
  classCode,
  className,
  submittedCount,
  totalAssignments,
}: AssignmentBoardHeroProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_58%,#0ea5e9_100%)] px-6 py-8 text-white sm:px-8">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,.5) 0, transparent 28%), radial-gradient(circle at 80% 0, rgba(255,255,255,.35) 0, transparent 26%)",
          }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              Trabajo de clase
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {className || 'Centro de asignaciones'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-[0.95rem]">
              Organiza tareas, fechas de entrega y seguimiento del grupo con una vista limpia inspirada en el módulo de clases de referencia.
            </p>
            {classCode && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-200">
                  Código
                </span>
                <span className="font-mono text-sm font-semibold tracking-[0.24em] text-white">
                  {classCode}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(classCode)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                  title="Copiar código"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 10h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-200">Asignaciones</p>
              <p className="mt-2 text-3xl font-semibold">{totalAssignments}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-200">Entregadas</p>
              <p className="mt-2 text-3xl font-semibold">{submittedCount}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
