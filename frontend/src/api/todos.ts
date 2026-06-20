export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled'

export interface TaskItem {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  status: TaskStatus
}

export interface CreateTaskPayload {
  name: string
  description?: string | null
  status?: TaskStatus
}

export interface UpdateTaskPayload {
  name: string
  description?: string | null
  status: TaskStatus
}

const API_URL = import.meta.env.VITE_API_URL

const TASK_STATUSES: TaskStatus[] = [
  'Pending',
  'InProgress',
  'Completed',
  'Cancelled',
]

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus)
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function getTodos(): Promise<TaskItem[]> {
  const response = await fetch(`${API_URL}/todos`)
  return handleResponse<TaskItem[]>(response)
}

export async function createTodo(payload: CreateTaskPayload): Promise<TaskItem> {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description ?? null,
      status: payload.status ?? 'Pending',
    }),
  })
  return handleResponse<TaskItem>(response)
}

export async function updateTodo(
  id: number,
  payload: UpdateTaskPayload,
): Promise<void> {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<void>(response)
}

export async function updateTodoStatus(
  id: number,
  status: TaskStatus,
): Promise<void> {
  const response = await fetch(`${API_URL}/todos/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return handleResponse<void>(response)
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
  })
  return handleResponse<void>(response)
}

export { TASK_STATUSES }
