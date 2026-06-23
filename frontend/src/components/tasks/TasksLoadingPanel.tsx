import Spinner from '../Spinner'

export default function TasksLoadingPanel() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 py-14"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-50/60">
        <Spinner size="lg" label="Loading tasks" />
      </span>
      <p className="text-sm font-medium text-slate-700">Preparing your task list...</p>
      <p className="text-xs text-slate-400">This will only take a moment</p>
    </div>
  )
}
