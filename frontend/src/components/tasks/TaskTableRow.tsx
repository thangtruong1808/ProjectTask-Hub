import type { UserDto } from '../../api/client'
import type { TaskItem } from '../../api/todos'
import { formatDate } from '../../utils/taskFormatting'
import Spinner from '../Spinner'
import TaskAssignSelect from './TaskAssignSelect'
import TaskStatusBadge from './TaskStatusBadge'
import { deleteActionBtnClass, editActionBtnClass } from './taskStyles'

interface TaskTableRowProps {
  task: TaskItem
  sequenceNumber: number
  isSelected: boolean
  isRowDeleting: boolean
  isRowAssigning: boolean
  isRowEditing: boolean
  isSavingEdit: boolean
  canAssign: boolean
  canDeleteTask: boolean
  assignUsers: UserDto[]
  assignLoading: boolean
  assignLoaded: boolean
  onAssign: (taskId: number, userId: number) => void
  onEdit: (task: TaskItem) => void
  onDelete: (id: number, name: string) => void
}

export default function TaskTableRow({
  task,
  sequenceNumber,
  isSelected,
  isRowDeleting,
  isRowAssigning,
  isRowEditing,
  isSavingEdit,
  canAssign,
  canDeleteTask,
  assignUsers,
  assignLoading,
  assignLoaded,
  onAssign,
  onEdit,
  onDelete,
}: TaskTableRowProps) {
  return (
    <tr
      className={`transition-colors hover:bg-slate-50/80 ${isSelected ? 'bg-blue-50/40' : ''}`}
    >
      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-500 sm:px-4">
        {sequenceNumber}
      </td>

      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-700 sm:px-4">
        {task.id}
      </td>

      <td className="px-3 py-3 sm:px-4">
        <span className="block truncate font-medium text-slate-900">
          {task.name}
        </span>
      </td>

      <td className="hidden px-3 py-3 lg:table-cell sm:px-4">
        <span
          className="block truncate text-slate-600"
          title={task.description ?? undefined}
        >
          {task.description || '—'}
        </span>
      </td>

      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
        <TaskStatusBadge status={task.status} />
      </td>

      <td className="hidden px-3 py-3 text-xs text-slate-500 lg:table-cell sm:px-4">
        {formatDate(task.createdAt)}
      </td>

      <td className="hidden px-3 py-3 text-xs text-slate-500 xl:table-cell sm:px-4">
        {formatDate(task.updatedAt)}
      </td>

      {canAssign && (
        <td className="hidden px-3 py-3 lg:table-cell sm:px-4">
          <TaskAssignSelect
            task={task}
            users={assignUsers}
            loadingUsers={assignLoading}
            loaded={assignLoaded}
            isRowAssigning={isRowAssigning}
            isRowDeleting={isRowDeleting}
            canAssign={canAssign}
            onAssign={onAssign}
          />
        </td>
      )}

      <td className="whitespace-nowrap px-3 py-3 sm:px-4">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            disabled={isRowDeleting || isRowEditing || isSavingEdit}
            aria-label={`Edit task ${task.id}`}
            aria-busy={isRowEditing}
            className={editActionBtnClass}
          >
            {isRowEditing && (
              <Spinner size="sm" label="Saving task" />
            )}
            Edit
          </button>
          {canDeleteTask && (
            <button
              type="button"
              onClick={() => onDelete(task.id, task.name)}
              disabled={isRowDeleting || isRowEditing || isSavingEdit}
              aria-label={`Delete task ${task.id}`}
              aria-busy={isRowDeleting}
              className={deleteActionBtnClass}
            >
              {isRowDeleting && (
                <Spinner size="sm" label="Deleting task" />
              )}
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
