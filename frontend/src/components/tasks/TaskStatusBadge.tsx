import type { TaskStatus } from '../../api/todos'
import { STATUS_LABELS, STATUS_STYLES } from './taskConstants'

interface TaskStatusBadgeProps {
  status: TaskStatus
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
