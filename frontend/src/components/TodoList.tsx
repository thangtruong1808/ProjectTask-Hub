import { useEffect, useState, type FormEvent } from 'react'
import {
  createTodo,
  deleteTodo,
  getTodos,
  TASK_STATUSES,
  updateTodoStatus,
  type TaskItem,
  type TaskStatus,
} from '../api/todos'

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

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export default function TodoList() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

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

  async function handleAddTask(event: FormEvent) {
    event.preventDefault()

    const name = newTaskName.trim()
    if (!name) {
      return
    }

    try {
      setError(null)
      const created = await createTodo({
        name,
        description: newTaskDescription.trim() || null,
        status: 'Pending',
      })
      setTasks((current) => [created, ...current])
      setNewTaskName('')
      setNewTaskDescription('')
    } catch {
      setError('Could not create task.')
    }
  }

  async function handleStatusChange(task: TaskItem, status: TaskStatus) {
    if (task.status === status) {
      return
    }

    try {
      setError(null)
      await updateTodoStatus(task.id, status)
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item,
        ),
      )
    } catch {
      setError('Could not update task status.')
    }
  }

  async function handleDelete(id: number) {
    try {
      setError(null)
      await deleteTodo(id)
      setTasks((current) => current.filter((item) => item.id !== id))
    } catch {
      setError('Could not delete task.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Task List</h1>

      <form onSubmit={handleAddTask} className="mb-6 space-y-3">
        <input
          type="text"
          value={newTaskName}
          onChange={(event) => setNewTaskName(event.target.value)}
          placeholder="Task name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <textarea
          value={newTaskDescription}
          onChange={(event) => setNewTaskDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Add Task
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-slate-500">No tasks yet. Add one above.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Task #{task.id}
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {task.name}
                  </h2>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[task.status]}`}
                >
                  {STATUS_LABELS[task.status]}
                </span>
              </div>

              {task.description && (
                <p className="mb-3 text-sm text-slate-600">{task.description}</p>
              )}

              <div className="mb-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                <p>Created: {formatDate(task.createdAt)}</p>
                <p>Updated: {formatDate(task.updatedAt)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-slate-600" htmlFor={`status-${task.id}`}>
                  Status:
                </label>
                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  onChange={(event) =>
                    handleStatusChange(task, event.target.value as TaskStatus)
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="ml-auto rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
