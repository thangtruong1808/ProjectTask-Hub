import type { TaskItem } from '../api/todos'
import {
  STATUS_ORDER,
  type SortState,
} from '../components/tasks/taskConstants'
import { parseApiDate } from './taskFormatting'

export type { SortKey, SortDirection, SortState } from '../components/tasks/taskConstants'

export function compareTasks(a: TaskItem, b: TaskItem, sortState: SortState): number {
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
