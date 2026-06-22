import { apiFetch } from './client'
import type { TaskItem } from './todos'

export interface DashboardStats {
  totalTasks: number
  totalUsers: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  cancelledTasks: number
  recentAssignments: TaskItem[]
}

export function getDashboardStats() {
  return apiFetch<DashboardStats>('/dashboard/stats')
}
