import Spinner from '../Spinner'

interface PageLoadingPanelProps {
  label: string
  hint?: string
}

export default function PageLoadingPanel({ label, hint }: PageLoadingPanelProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-14 shadow-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-50/60">
        <Spinner size="lg" label={label} />
      </span>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
