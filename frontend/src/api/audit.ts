import { apiFetch } from './client'
import type { UserRole } from './client'

export interface AuditEventItem {
  id: number
  actorUserId: number | null
  actorRole: UserRole
  actorFullName: string
  action: string
  entityType: string
  entityId: number | null
  projectId: number | null
  projectName: string | null
  targetUserId: number | null
  summary: string
  metadata: string | null
  createdAt: string
}

export interface AuditEventListResponse {
  items: AuditEventItem[]
  total: number
  page: number
  pageSize: number
}

export interface AuditQuery {
  search?: string
  action?: string
  actorRole?: UserRole | ''
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

const ACTION_LABELS: Record<string, string> = {
  TaskCreated: 'Task created',
  TaskUpdated: 'Task updated',
  TaskDeleted: 'Task deleted',
  TaskAssigned: 'Task assigned',
  TaskStatusChanged: 'Status changed',
  ProjectCreated: 'Project created',
  ProjectUpdated: 'Project updated',
  ProjectDeleted: 'Project archived',
  ProjectMemberAdded: 'Member added',
  ProjectMemberRemoved: 'Member removed',
  UserRoleChanged: 'Role changed',
  UserLoggedIn: 'Signed in',
}

export function auditActionLabel(action: string) {
  return ACTION_LABELS[action] ?? action
}

export const AUDIT_ACTION_OPTIONS = Object.entries(ACTION_LABELS).map(([value, label]) => ({
  value,
  label,
}))

function buildQuery(params: AuditQuery) {
  const search = new URLSearchParams()
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.action) search.set('action', params.action)
  if (params.actorRole) search.set('actorRole', params.actorRole)
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  return search.toString()
}

export async function getAuditEvents(query: AuditQuery = {}) {
  const qs = buildQuery(query)
  return apiFetch<AuditEventListResponse>(`/audit${qs ? `?${qs}` : ''}`)
}

export function formatAuditTime(value: string) {
  const normalized = value.trim()
  const date = normalized.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(normalized)
    ? new Date(normalized)
    : new Date(`${normalized.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
