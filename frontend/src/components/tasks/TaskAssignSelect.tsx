import type { UserDto } from '../../api/client'
import type { TaskItem } from '../../api/todos'
import Spinner from '../Spinner'
import { selectClass } from './taskStyles'

interface TaskAssignSelectProps {
  task: TaskItem
  users: UserDto[]
  loadingUsers: boolean
  loaded: boolean
  isRowAssigning: boolean
  isRowDeleting: boolean
  canAssign: boolean
  onAssign: (taskId: number, userId: number) => void
}

export default function TaskAssignSelect({
  task,
  users,
  loadingUsers,
  loaded,
  isRowAssigning,
  isRowDeleting,
  canAssign,
  onAssign,
}: TaskAssignSelectProps) {
  return (
    <div className="relative w-full min-w-[9rem]">
      <select
        value={task.assignedToUserId ?? ''}
        onChange={(e) => {
          const userId = Number(e.target.value)
          if (userId) onAssign(task.id, userId)
        }}
        disabled={isRowDeleting || isRowAssigning || loadingUsers}
        className={`${selectClass} ${loadingUsers ? 'border-blue-200 bg-blue-50/40' : ''}`}
        aria-label={`Assign task ${task.id}`}
        aria-busy={loadingUsers || isRowAssigning}
      >
        <option value="" disabled>
          {loadingUsers ? 'Loading users...' : 'Select user...'}
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.firstName} {u.lastName}
          </option>
        ))}
      </select>
      {loadingUsers && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]"
          aria-hidden="true"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-2 py-0.5 text-xs font-medium text-blue-700 shadow-sm">
            <Spinner size="sm" label="Loading users" />
            Loading...
          </span>
        </div>
      )}
      {isRowAssigning && !loadingUsers && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600">
          <Spinner size="sm" label="Assigning task" />
          Assigning...
        </p>
      )}
      {loaded && !loadingUsers && users.length === 0 && (
        <p className="mt-1 text-xs text-slate-500">
          {canAssign
            ? 'No users in this project. Filter by project above and add team members.'
            : 'No users available in this project.'}
        </p>
      )}
    </div>
  )
}
