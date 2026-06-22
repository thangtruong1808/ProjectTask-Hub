import { apiFetch, type UserDto } from './client'

export interface ProjectItem {
  id: number
  name: string
  code: string | null
}

export interface ProjectMemberItem {
  userId: number
  email: string
  firstName: string
  lastName: string
  assignedAt: string
}

type RawProject = Record<string, unknown>
type RawMember = Record<string, unknown>

function normalizeProject(raw: RawProject): ProjectItem {
  return {
    id: Number(raw.id ?? raw.Id),
    name: String(raw.name ?? raw.Name ?? ''),
    code: raw.code != null || raw.Code != null ? String(raw.code ?? raw.Code) : null,
  }
}

function normalizeMember(raw: RawMember): ProjectMemberItem {
  const assignedAt = raw.assignedAt ?? raw.AssignedAt
  return {
    userId: Number(raw.userId ?? raw.UserId),
    email: String(raw.email ?? raw.Email ?? ''),
    firstName: String(raw.firstName ?? raw.FirstName ?? ''),
    lastName: String(raw.lastName ?? raw.LastName ?? ''),
    assignedAt: String(assignedAt ?? ''),
  }
}

export async function getProjects() {
  const data = await apiFetch<RawProject[]>('/projects')
  return data.map(normalizeProject)
}

export async function getProjectMembers(projectId: number) {
  const data = await apiFetch<RawMember[]>(`/projects/${projectId}/members`)
  return data.map(normalizeMember)
}

export async function assignProjectMember(projectId: number, userId: number) {
  return apiFetch<void>(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export async function removeProjectMember(projectId: number, userId: number) {
  return apiFetch<void>(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  })
}

export function memberDisplayName(member: ProjectMemberItem | UserDto) {
  const name = `${member.firstName} ${member.lastName}`.trim()
  return name || member.email
}
