import type { UserDto } from '../../api/client'
import type { TaskItem } from '../../api/todos'
import { formatDate } from '../../utils/taskFormatting'
import Spinner from '../Spinner'
import TaskAssignSelect from './TaskAssignSelect'
import TaskStatusBadge from './TaskStatusBadge'
import { deleteActionBtnClass, editActionBtnClass } from './taskStyles'

interface TaskMobileCardProps {
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

export default function TaskMobileCard({
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
}: TaskMobileCardProps) {
  return (
    <article
      className={`rounded-xl border p-4 transition-colors ${isSelected ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          #{sequenceNumber} · Task ID {task.id}
        </p>
        <TaskStatusBadge status={task.status} />
      </div>

      <h2 className="mb-1 font-semibold text-slate-900">
        {task.name}
      </h2>
      {task.description && (
        <p className="mb-2 text-sm text-slate-600">
          {task.description}
        </p>
      )}
      <p className="text-xs text-slate-500">
        Updated: {formatDate(task.updatedAt)}
      </p>

      {canAssign && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Assign to
          </label>
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
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={isRowDeleting || isRowEditing || isSavingEdit}
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
    </article>
  )
}
