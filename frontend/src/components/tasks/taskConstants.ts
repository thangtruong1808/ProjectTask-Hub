import type { TaskStatus } from '../../api/todos'

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

export const STATUS_STYLES: Record<TaskStatus, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export type ActionLoading =
  | { type: 'create' }
  | { type: 'edit'; id: number }
  | { type: 'delete'; id: number }
  | { type: 'assign'; id: number }
  | null

export interface DeleteTarget {
  id: number
  name: string
}

export const SUCCESS_DISMISS_MS = 4000
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

export const STATUS_ORDER: Record<TaskStatus, number> = {
  Pending: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
}

export type SortKey = 'id' | 'name' | 'description' | 'status' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: SortKey
  direction: SortDirection
}
