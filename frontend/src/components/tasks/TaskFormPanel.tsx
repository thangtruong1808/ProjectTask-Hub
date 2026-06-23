import type { FormEvent, RefObject } from 'react'
import { TASK_STATUSES, type TaskStatus } from '../../api/todos'
import type { ProjectItem } from '../../api/projects'
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_NAME_MAX_LENGTH,
  validateTaskDescription,
  validateTaskName,
  type TaskFormErrors,
} from '../../utils/taskValidation'
import { CharacterCount, FieldError, fieldErrorClass } from '../FormFieldHelpers'
import { FolderIcon, XMarkIcon } from '../icons/Icons'
import Spinner from '../Spinner'
import { STATUS_LABELS } from './taskConstants'
import { selectClass } from './taskStyles'
import TaskStatusBadge from './TaskStatusBadge'

interface TaskFormPanelProps {
  taskFormRef: RefObject<HTMLFormElement | null>
  isEditing: boolean
  editingId: number | null
  editingProjectLabel: string | null
  isNameDescriptionReadOnly: boolean
  canCreateTask: boolean
  canEditTaskDetails: boolean
  showAddForm: boolean
  projects: ProjectItem[]
  projectsLoading: boolean
  newTaskName: string
  onNewTaskNameChange: (value: string) => void
  newTaskDescription: string
  onNewTaskDescriptionChange: (value: string) => void
  newTaskStatus: TaskStatus | ''
  onNewTaskStatusChange: (value: TaskStatus | '') => void
  newTaskProjectId: number | ''
  onNewTaskProjectIdChange: (value: number | '') => void
  formErrors: TaskFormErrors
  onFormErrorsChange: (updater: (current: TaskFormErrors) => TaskFormErrors) => void
  isFormSubmitting: boolean
  isSavingEdit: boolean
  onSubmit: (event: FormEvent) => void
  onCancelEdit: () => void
  onCancelAddForm: () => void
  onClearFieldError: (field: keyof TaskFormErrors) => void
}

export default function TaskFormPanel({
  taskFormRef,
  isEditing,
  editingId,
  editingProjectLabel,
  isNameDescriptionReadOnly,
  canCreateTask,
  canEditTaskDetails,
  showAddForm,
  projects,
  projectsLoading,
  newTaskName,
  onNewTaskNameChange,
  newTaskDescription,
  onNewTaskDescriptionChange,
  newTaskStatus,
  onNewTaskStatusChange,
  newTaskProjectId,
  onNewTaskProjectIdChange,
  formErrors,
  onFormErrorsChange,
  isFormSubmitting,
  isSavingEdit,
  onSubmit,
  onCancelEdit,
  onCancelAddForm,
  onClearFieldError,
}: TaskFormPanelProps) {
  if (!isEditing && !(showAddForm && canCreateTask)) {
    return null
  }

  return (
    <form
      ref={taskFormRef}
      onSubmit={onSubmit}
      className={`mb-6 space-y-4 ${isEditing
          ? 'rounded-xl border border-blue-200 bg-blue-50/30 p-4 sm:p-5'
          : 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'
        }`}
    >
      {isEditing ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Editing Task #{editingId}
            </p>
            {editingProjectLabel && (
              <p className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                <FolderIcon size={14} className="shrink-0 text-blue-600" />
                <span className="truncate">{editingProjectLabel}</span>
              </p>
            )}
            {isNameDescriptionReadOnly && (
              <p className="mt-1 text-xs text-slate-500">
                Task name and description are read-only. You can update status only.
              </p>
            )}
          </div>
          <TaskStatusBadge status={newTaskStatus as TaskStatus} />
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">New Task</p>
            <p className="text-xs text-slate-500">
              Create a task in one of your projects.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelAddForm}
            disabled={isFormSubmitting}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-70"
          >
            <XMarkIcon size={14} />
            Close
          </button>
        </div>
      )}

      {canCreateTask && !isEditing && (
        <div>
          <label htmlFor="task-project" className="mb-1 block text-sm font-medium text-slate-600">
            Project <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            {projectsLoading && (
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <Spinner size="sm" label="Loading projects" />
              </span>
            )}
            <select
              id="task-project"
              value={newTaskProjectId}
              onChange={(e) => {
                const value = e.target.value
                onNewTaskProjectIdChange(value === '' ? '' : Number(value))
              }}
              required
              disabled={isFormSubmitting || projectsLoading}
              className={`${selectClass} ${projectsLoading ? 'border-blue-200 bg-blue-50/40 pr-10' : ''}`}
            >
              <option value="" disabled>
                {projectsLoading ? 'Loading projects...' : 'Select project...'}
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.code ? `${project.code} — ${project.name}` : project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="task-name"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Task name <span className="text-red-500">*</span>
          {isNameDescriptionReadOnly && (
            <span className="ml-1 font-normal text-slate-400">(read-only)</span>
          )}
        </label>
        <input
          id="task-name"
          type="text"
          value={newTaskName}
          onChange={(event) => {
            onNewTaskNameChange(event.target.value)
            onClearFieldError('name')
          }}
          onBlur={() => {
            if (isNameDescriptionReadOnly) return
            const nameError = validateTaskName(newTaskName)
            onFormErrorsChange((current) => {
              const next = { ...current }
              if (nameError) {
                next.name = nameError
              } else {
                delete next.name
              }
              return next
            })
          }}
          placeholder="Enter task name"
          maxLength={TASK_NAME_MAX_LENGTH}
          aria-invalid={Boolean(formErrors.name)}
          aria-describedby={
            [formErrors.name ? 'task-name-error' : null, 'task-name-count']
              .filter(Boolean)
              .join(' ') || undefined
          }
          readOnly={isNameDescriptionReadOnly}
          className={`w-full rounded-lg border px-3 py-2 text-slate-900 outline-none focus:ring-2 ${fieldErrorClass(Boolean(formErrors.name))} ${isNameDescriptionReadOnly ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600' : ''}`}
          disabled={isFormSubmitting || isNameDescriptionReadOnly}
        />
        <FieldError id="task-name-error" message={formErrors.name} />
        <CharacterCount
          id="task-name-count"
          current={newTaskName.trim().length}
          max={TASK_NAME_MAX_LENGTH}
        />
      </div>

      <div>
        <label
          htmlFor="task-description"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Description <span className="text-slate-400">(optional)</span>
          {isNameDescriptionReadOnly && (
            <span className="ml-1 font-normal text-slate-400">(read-only)</span>
          )}
        </label>
        <textarea
          id="task-description"
          value={newTaskDescription}
          onChange={(event) => {
            onNewTaskDescriptionChange(event.target.value)
            onClearFieldError('description')
          }}
          onBlur={() => {
            if (isNameDescriptionReadOnly) return
            const descriptionError = validateTaskDescription(newTaskDescription)
            onFormErrorsChange((current) => {
              const next = { ...current }
              if (descriptionError) {
                next.description = descriptionError
              } else {
                delete next.description
              }
              return next
            })
          }}
          placeholder="Enter task description"
          rows={3}
          maxLength={TASK_DESCRIPTION_MAX_LENGTH}
          aria-invalid={Boolean(formErrors.description)}
          aria-describedby={
            [
              formErrors.description ? 'task-description-error' : null,
              'task-description-count',
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          readOnly={isNameDescriptionReadOnly}
          className={`w-full rounded-lg border px-3 py-2 text-slate-900 outline-none focus:ring-2 ${fieldErrorClass(Boolean(formErrors.description))} ${isNameDescriptionReadOnly ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600' : ''}`}
          disabled={isFormSubmitting || isNameDescriptionReadOnly}
        />
        <FieldError
          id="task-description-error"
          message={formErrors.description}
        />
        <CharacterCount
          id="task-description-count"
          current={newTaskDescription.trim().length}
          max={TASK_DESCRIPTION_MAX_LENGTH}
        />
      </div>

      <div>
        <label
          htmlFor="task-status"
          className="mb-1 block text-sm font-medium text-slate-600"
        >
          Status
        </label>
        <select
          id="task-status"
          value={newTaskStatus}
          onChange={(event) => {
            const value = event.target.value
            onNewTaskStatusChange(value === '' ? '' : (value as TaskStatus))
          }}
          className={`${selectClass} ${isSavingEdit ? 'border-blue-200 bg-blue-50/40' : ''}`}
          disabled={isFormSubmitting}
          aria-busy={isSavingEdit}
        >
          <option value="" disabled={isEditing}>
            Select status...
          </option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {isSavingEdit && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-blue-600">
            <Spinner size="sm" label="Saving task status" />
            Saving changes...
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isFormSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isFormSubmitting && (
            <Spinner
              size="sm"
              label={isEditing ? 'Saving task' : 'Creating task'}
            />
          )}
          {isEditing ? (canEditTaskDetails ? 'Save Changes' : 'Save Status') : 'Add Task'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isFormSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
