import { apiFetch, type UserDto, type UserRole } from './client'

export interface UserListItem {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: UserRole
  createdAt: string
}

type RawUserListItem = Record<string, unknown>

function normalizeUserListItem(raw: RawUserListItem): UserListItem {
  const roleRaw = String(raw.role ?? raw.Role ?? 'User')
  const role = (roleRaw === 'Admin' || roleRaw === 'ProjectManager' || roleRaw === 'User'
    ? roleRaw
    : 'User') as UserRole

  return {
    id: Number(raw.id ?? raw.Id),
    email: String(raw.email ?? raw.Email ?? ''),
    firstName: String(raw.firstName ?? raw.FirstName ?? ''),
    lastName: String(raw.lastName ?? raw.LastName ?? ''),
    phone: raw.phone != null || raw.Phone != null ? String(raw.phone ?? raw.Phone) : null,
    role,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ''),
  }
}

function normalizeUserDto(raw: Record<string, unknown>): UserDto {
  const roleRaw = String(raw.role ?? raw.Role ?? 'User')
  const role = (roleRaw === 'Admin' || roleRaw === 'ProjectManager' || roleRaw === 'User'
    ? roleRaw
    : 'User') as UserRole

  return {
    id: Number(raw.id ?? raw.Id),
    email: String(raw.email ?? raw.Email ?? ''),
    firstName: String(raw.firstName ?? raw.FirstName ?? ''),
    lastName: String(raw.lastName ?? raw.LastName ?? ''),
    phone: raw.phone != null || raw.Phone != null ? String(raw.phone ?? raw.Phone) : null,
    role,
  }
}

export function getProfile() {
  return apiFetch<UserDto>('/users/me')
}

export function updateProfile(payload: {
  firstName: string
  lastName: string
  phone?: string | null
}) {
  return apiFetch<void>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<void>('/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function getAssignableUsers() {
  return apiFetch<UserDto[]>('/users/assignable')
}

export async function getAdminUsers() {
  const data = await apiFetch<RawUserListItem[]>('/users')
  return data.map(normalizeUserListItem)
}

export async function updateUserRole(id: number, role: UserRole) {
  const data = await apiFetch<Record<string, unknown>>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  return normalizeUserDto(data)
}

export function userDisplayName(user: Pick<UserListItem, 'firstName' | 'lastName' | 'email'>) {
  const name = `${user.firstName} ${user.lastName}`.trim()
  return name || user.email
}

export const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'User', label: 'User' },
  { value: 'ProjectManager', label: 'Project Manager' },
  { value: 'Admin', label: 'Admin' },
]
