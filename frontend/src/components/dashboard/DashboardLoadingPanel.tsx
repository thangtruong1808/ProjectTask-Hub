import Spinner from '../Spinner'

interface DashboardLoadingPanelProps {
  label: string
  hint?: string
}

export default function DashboardLoadingPanel({ label, hint }: DashboardLoadingPanelProps) {
  return (
    <div
      className="flex min-h-[16rem] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-16 shadow-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-50/60">
        <Spinner size="lg" label={label} />
      </span>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
