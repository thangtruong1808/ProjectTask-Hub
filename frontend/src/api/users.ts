import { apiFetch, type UserDto } from './client'

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
