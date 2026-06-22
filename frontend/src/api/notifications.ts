import { apiFetch } from './client'

export interface NotificationItem {
  id: number
  userId: number
  type: string
  title: string
  message: string
  taskId: number | null
  isRead: boolean
  createdAt: string
}

export interface NotificationListResponse {
  items: NotificationItem[]
  unreadCount: number
}

export function getNotifications(limit = 20, offset = 0) {
  return apiFetch<NotificationListResponse>(
    `/notifications?limit=${limit}&offset=${offset}`,
  )
}

export function markNotificationRead(id: number) {
  return apiFetch<void>(`/notifications/${id}/read`, { method: 'PATCH' })
}

export function markAllNotificationsRead() {
  return apiFetch<void>('/notifications/read-all', { method: 'PATCH' })
}
