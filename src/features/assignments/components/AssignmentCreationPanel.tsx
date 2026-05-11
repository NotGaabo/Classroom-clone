interface AssignmentCreationPanelProps {
  dateError: string | null
  description: string
  dueDate: string
  dueTime: string
  hasInvalidDueDate: boolean
  minDueDate: string
  minDueTime: string
  points: number | ''
  setDateError: (value: string | null) => void
  setDescription: (value: string) => void
  setDueDate: (value: string) => void
  setDueTime: (value: string) => void
  setPoints: (value: number | '') => void
  setTitle: (value: string) => void
  submitting: boolean
  title: string
  onCreateAssignment: () => void
}

export function AssignmentCreationPanel({
  dateError,
  description,
  dueDate,
  dueTime,
  hasInvalidDueDate,
  minDueDate,
  minDueTime,
  points,
  setDateError,
  setDescription,
  setDueDate,
  setDueTime,
  setPoints,
  setTitle,
  submitting,
  title,
  onCreateAssignment,
}: AssignmentCreationPanelProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profesor</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Publicar una nueva tarea</h2>
        </div>
        <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Visible para la clase
        </div>
      </div>

      <div className="grid gap-4">
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
          type="text"
          placeholder="Título de la asignación"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <textarea
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
          placeholder="Descripción, instrucciones o criterios de entrega"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            type="date"
            min={minDueDate}
            value={dueDate}
            onChange={(event) => {
              const nextDate = event.target.value
              setDueDate(nextDate)

              if (nextDate !== minDueDate) {
                setDateError(null)
                return
              }

              if (dueTime && dueTime < minDueTime) {
                setDueTime('')
              }

              setDateError(null)
            }}
          />

          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            type="time"
            min={dueDate === minDueDate ? minDueTime : undefined}
            value={dueTime}
            onChange={(event) => {
              const nextTime = event.target.value
              setDueTime(nextTime)

              if (dueDate === minDueDate && nextTime && nextTime < minDueTime) {
                setDateError('La hora de entrega para hoy debe ser actual o futura.')
                return
              }

              setDateError(null)
            }}
            disabled={!dueDate}
          />

          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            type="number"
            min="0"
            step="1"
            value={points}
            onChange={(event) => {
              const value = event.target.value
              setPoints(value === '' ? '' : Math.max(0, Number.parseInt(value, 10) || 0))
            }}
            placeholder="Puntos"
          />
        </div>

        {dateError && <p className="text-sm font-medium text-rose-600">{dateError}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Puedes dejar la fecha vacía si la tarea no tiene vencimiento.
          </p>
          <button
            onClick={onCreateAssignment}
            disabled={submitting || !title.trim() || hasInvalidDueDate}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563eb,#0284c7)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? 'Publicando...' : 'Publicar asignación'}
          </button>
        </div>
      </div>
    </section>
  )
}
