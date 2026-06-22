import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  createTodo,
  deleteTodo,
  getTodos,
  TASK_STATUSES,
  updateTodo,
  type TaskItem,
  type TaskStatus,
} from '../api/todos'
import DeleteDialog from './DeleteDialog'
import InlineMessage from './InlineMessage'
import Spinner from './Spinner'
import TablePagination from './TablePagination'

const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

type ActionLoading =
  | { type: 'create' }
  | { type: 'edit'; id: number }
  | { type: 'delete'; id: number }
  | null

interface DeleteTarget {
  id: number
  name: string
}

const selectClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

const actionBtnClass =
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const editActionBtnClass = `${actionBtnClass} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`

const deleteActionBtnClass = `${actionBtnClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`

const SUCCESS_DISMISS_MS = 4000
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

const STATUS_ORDER: Record<TaskStatus, number> = {
  Pending: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
}

type SortKey = 'id' | 'name' | 'description' | 'status' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

interface SortState {
  key: SortKey
  direction: SortDirection
}

function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function parseApiDate(value: string): Date {
  const normalized = value.trim()

  if (
    normalized.endsWith('Z') ||
    /[+-]\d{2}:\d{2}$/.test(normalized)
  ) {
    return new Date(normalized)
  }

  // API stores UTC but may serialize without a timezone suffix.
  return new Date(`${normalized}Z`)
}

function formatDate(value: string) {
  const date = parseApiDate(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

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

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className = '',
}: {
  label: string
  sortKey: SortKey
  currentSort: SortState
  onSort: (key: SortKey) => void
  className?: string
}) {
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

function compareTasks(a: TaskItem, b: TaskItem, sortState: SortState): number {
  let comparison = 0

  switch (sortState.key) {
    case 'id':
      comparison = a.id - b.id
      break
    case 'name':
      comparison = a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
      })
      break
    case 'description':
      comparison = (a.description ?? '').localeCompare(b.description ?? '', undefined, {
        sensitivity: 'base',
      })
      break
    case 'status':
      comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      break
    case 'createdAt':
      comparison =
        parseApiDate(a.createdAt).getTime() - parseApiDate(b.createdAt).getTime()
      break
    case 'updatedAt':
      comparison =
        parseApiDate(a.updatedAt).getTime() - parseApiDate(b.updatedAt).getTime()
      break
  }

  return sortState.direction === 'asc' ? comparison : -comparison
}

export default function TodoList() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nameError, setNameError] = useState(false)
  const [actionLoading, setActionLoading] = useState<ActionLoading>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [sortState, setSortState] = useState<SortState>({
    key: 'updatedAt',
    direction: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const taskFormRef = useRef<HTMLFormElement>(null)

  const isEditing = editingId !== null
  const isCreating = actionLoading?.type === 'create'
  const isSavingEdit =
    actionLoading?.type === 'edit' && editingId !== null
  const isFormSubmitting = isCreating || isSavingEdit
  const isDeleting =
    actionLoading?.type === 'delete' &&
    deleteTarget !== null &&
    actionLoading.id === deleteTarget.id

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => compareTasks(a, b, sortState))
  }, [tasks, sortState])

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / pageSize))

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedTasks.slice(start, start + pageSize)
  }, [sortedTasks, currentPage, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, SUCCESS_DISMISS_MS)

    return () => window.clearTimeout(timer)
  }, [successMessage])

  function resetTaskForm() {
    setEditingId(null)
    setNewTaskName('')
    setNewTaskDescription('')
    setNewTaskStatus('')
    setNameError(false)
  }

  async function loadTasks() {
    try {
      setLoading(true)
      setError(null)
      const data = await getTodos()
      setTasks(data)
    } catch {
      setError('Could not load tasks. Check that the API is running.')
    } finally {
      setLoading(false)
    }
  }

  function showSuccess(message: string) {
    setSuccessMessage(message)
    setError(null)
  }

  async function handleSubmitTask(event: FormEvent) {
    event.preventDefault()

    const name = newTaskName.trim()
    if (!name) {
      setNameError(true)
      return
    }

    if (isEditing) {
      const id = editingId

      try {
        setActionLoading({ type: 'edit', id })
        setError(null)
        await updateTodo(id, {
          name,
          description: newTaskDescription.trim() || null,
          status: newTaskStatus as TaskStatus,
        })
        setTasks((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  name,
                  description: newTaskDescription.trim() || null,
                  status: newTaskStatus as TaskStatus,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        )
        resetTaskForm()
        showSuccess(`Task "${name}" updated successfully.`)
      } catch {
        setError('Could not update task.')
        setSuccessMessage(null)
      } finally {
        setActionLoading(null)
      }

      return
    }

    try {
      setActionLoading({ type: 'create' })
      setError(null)
      const created = await createTodo({
        name,
        description: newTaskDescription.trim() || null,
        status: newTaskStatus || undefined,
      })
      setTasks((current) => [created, ...current])
      resetTaskForm()
      showSuccess(`Task "${name}" created successfully.`)
    } catch {
      setError('Could not create task.')
      setSuccessMessage(null)
    } finally {
      setActionLoading(null)
    }
  }

  function startEdit(task: TaskItem) {
    setEditingId(task.id)
    setNewTaskName(task.name)
    setNewTaskDescription(task.description ?? '')
    setNewTaskStatus(task.status)
    setNameError(false)
    setError(null)

    window.requestAnimationFrame(() => {
      taskFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function cancelEdit() {
    resetTaskForm()
  }

  function requestDelete(id: number, name: string) {
    setDeleteTarget({ id, name })
  }

  function handleSort(key: SortKey) {
    setSortState((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return { key, direction: 'asc' }
    })
    setCurrentPage(1)
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setCurrentPage(1)
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }

    const { id, name } = deleteTarget

    try {
      setActionLoading({ type: 'delete', id })
      setError(null)
      await deleteTodo(id)
      setTasks((current) => current.filter((item) => item.id !== id))
      if (editingId === id) {
        resetTaskForm()
      }
      setDeleteTarget(null)
      showSuccess(`Task "${name}" deleted successfully.`)
    } catch {
      setError('Could not delete task.')
      setSuccessMessage(null)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Task List</h1>

      <form
        ref={taskFormRef}
        onSubmit={handleSubmitTask}
        className={`mb-6 space-y-3 ${isEditing ? 'rounded-xl border border-blue-200 bg-blue-50/30 p-4 sm:p-5' : ''}`}
      >
        {isEditing && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              Editing Task #{editingId}
            </p>
            <StatusBadge status={newTaskStatus as TaskStatus} />
          </div>
        )}

        <input
          type="text"
          value={newTaskName}
          onChange={(event) => {
            setNewTaskName(event.target.value)
            setNameError(false)
          }}
          placeholder="Task name"
          className={`w-full rounded-lg border px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 ${nameError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500'}`}
          disabled={isFormSubmitting}
        />
        {nameError && (
          <p className="text-xs text-red-600">Task name is required.</p>
        )}

        <textarea
          value={newTaskDescription}
          onChange={(event) => setNewTaskDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          disabled={isFormSubmitting}
        />
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
              setNewTaskStatus(value === '' ? '' : (value as TaskStatus))
            }}
            className={selectClass}
            disabled={isFormSubmitting}
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
            {isEditing ? 'Save Changes' : 'Add Task'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isFormSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {successMessage && (
        <InlineMessage
          variant="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {error && (
        <InlineMessage
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 py-16">
          <Spinner size="lg" label="Loading tasks" />
          <p className="text-sm text-slate-500">Loading tasks...</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {tasks.length === 0 ? (
              <p className="rounded-xl border border-slate-200 px-4 py-12 text-center text-slate-500">
                No tasks yet. Add one above.
              </p>
            ) : (
              paginatedTasks.map((task, index) => {
                const isSelected = editingId === task.id
                const isRowDeleting =
                  actionLoading?.type === 'delete' &&
                  actionLoading.id === task.id
                const sequenceNumber = (currentPage - 1) * pageSize + index + 1

                return (
                  <article
                    key={task.id}
                    className={`rounded-xl border p-4 transition-colors ${isSelected ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-slate-500">
                        #{sequenceNumber} · Task ID {task.id}
                      </p>
                      <StatusBadge status={task.status} />
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

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        disabled={isRowDeleting}
                        className={editActionBtnClass}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(task.id, task.name)}
                        disabled={isRowDeleting}
                        className={deleteActionBtnClass}
                      >
                        {isRowDeleting && (
                          <Spinner size="sm" label="Deleting task" />
                        )}
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })
            )}

            {tasks.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sortedTasks.length}
                pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>

          <div className="hidden rounded-xl border border-slate-200 md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="w-[3rem] whitespace-nowrap px-3 py-3 sm:px-4">
                    #
                  </th>
                  <SortableHeader
                    label="ID"
                    sortKey="id"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="w-[3.5rem] whitespace-nowrap px-3 py-3 sm:px-4"
                  />
                  <SortableHeader
                    label="Name"
                    sortKey="name"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="w-[18%] px-3 py-3 sm:px-4"
                  />
                  <SortableHeader
                    label="Description"
                    sortKey="description"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="hidden w-[22%] px-3 py-3 lg:table-cell sm:px-4"
                  />
                  <SortableHeader
                    label="Status"
                    sortKey="status"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="w-[7.5rem] whitespace-nowrap px-3 py-3 sm:px-4"
                  />
                  <SortableHeader
                    label="Created"
                    sortKey="createdAt"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="hidden w-[11rem] whitespace-nowrap px-3 py-3 lg:table-cell sm:px-4"
                  />
                  <SortableHeader
                    label="Updated"
                    sortKey="updatedAt"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="hidden w-[11rem] whitespace-nowrap px-3 py-3 xl:table-cell sm:px-4"
                  />
                  <th className="w-[9.5rem] whitespace-nowrap px-3 py-3 text-right sm:px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No tasks yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map((task, index) => {
                    const isSelected = editingId === task.id
                    const isRowDeleting =
                      actionLoading?.type === 'delete' &&
                      actionLoading.id === task.id
                    const sequenceNumber = (currentPage - 1) * pageSize + index + 1

                    return (
                      <tr
                        key={task.id}
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
                          <StatusBadge status={task.status} />
                        </td>

                        <td className="hidden px-3 py-3 text-xs text-slate-500 lg:table-cell sm:px-4">
                          {formatDate(task.createdAt)}
                        </td>

                        <td className="hidden px-3 py-3 text-xs text-slate-500 xl:table-cell sm:px-4">
                          {formatDate(task.updatedAt)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 sm:px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(task)}
                              disabled={isRowDeleting}
                              aria-label={`Edit task ${task.id}`}
                              className={editActionBtnClass}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDelete(task.id, task.name)}
                              disabled={isRowDeleting}
                              aria-label={`Delete task ${task.id}`}
                              className={deleteActionBtnClass}
                            >
                              {isRowDeleting && (
                                <Spinner size="sm" label="Deleting task" />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            {tasks.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sortedTasks.length}
                pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        </>
      )}

      <DeleteDialog
        open={deleteTarget !== null}
        taskName={deleteTarget?.name ?? ''}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null)
          }
        }}
        isDeleting={isDeleting}
      />
    </div>
  )
}
