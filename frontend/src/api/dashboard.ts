import { apiFetch } from './client'

export interface DashboardStats {
  totalTasks: number
  totalUsers: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  cancelledTasks: number
}

export interface ProjectProgressItem {
  projectId: number
  projectName: string
  projectCode: string | null
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  total: number
}

export function getDashboardStats() {
  return apiFetch<DashboardStats>('/dashboard/stats')
}

export function getProjectProgress() {
  return apiFetch<ProjectProgressItem[]>('/dashboard/projects/progress')
}

export function getProjectProgressById(projectId: number) {
  return apiFetch<ProjectProgressItem>(`/dashboard/projects/${projectId}/progress`)
}

export function projectDisplayLabel(item: Pick<ProjectProgressItem, 'projectName' | 'projectCode'>) {
  return item.projectCode ? `${item.projectCode} — ${item.projectName}` : item.projectName
}

export function completionPercent(item: ProjectProgressItem) {
  if (item.total <= 0) return 0
  return Math.round((item.completed / item.total) * 100)
}
