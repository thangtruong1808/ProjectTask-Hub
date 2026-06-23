import type { SortDirection, SortKey, SortState } from './taskConstants'

function SortIndicator({
  active,
  direction,
}: {
  active: boolean
  direction: SortDirection
}) {
  return (
    <span
      className={`inline-flex flex-col leading-none ${active ? 'text-blue-600' : 'text-slate-400'}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 8 5"
        className={`h-2 w-2 ${active && direction === 'asc' ? 'opacity-100' : 'opacity-40'}`}
      >
        <path d="M4 0 7.5 4.5H0.5L4 0z" fill="currentColor" />
      </svg>
      <svg
        viewBox="0 0 8 5"
        className={`-mt-0.5 h-2 w-2 ${active && direction === 'desc' ? 'opacity-100' : 'opacity-40'}`}
      >
        <path d="M4 5 0.5 0.5h7L4 5z" fill="currentColor" />
      </svg>
    </span>
  )
}

interface TaskSortableHeaderProps {
  label: string
  sortKey: SortKey
  currentSort: SortState
  onSort: (key: SortKey) => void
  className?: string
}

export default function TaskSortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className = '',
}: TaskSortableHeaderProps) {
  const isActive = currentSort.key === sortKey

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 text-left transition-colors hover:text-slate-900"
        aria-label={`Sort by ${label}`}
        aria-sort={
          isActive
            ? currentSort.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
        }
      >
        <span>{label}</span>
        <SortIndicator active={isActive} direction={currentSort.direction} />
      </button>
    </th>
  )
}
