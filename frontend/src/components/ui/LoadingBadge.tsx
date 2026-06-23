import Spinner from '../Spinner'

interface LoadingBadgeProps {
  label: string
  className?: string
}

export default function LoadingBadge({ label, className = '' }: LoadingBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="sm" label={label} />
      <span>{label}</span>
    </span>
  )
}
