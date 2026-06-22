export const API_URL = import.meta.env.VITE_API_URL as string
export const HUB_URL = API_URL.replace(/\/api\/?$/, '') + '/hubs/notifications'

export type UserRole = 'User' | 'Admin' | 'ProjectManager'

export interface UserDto {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: UserRole
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDto
}

type AuthGetter = () => { accessToken: string | null; refreshToken: string | null }
type AuthSetter = (tokens: { accessToken: string; refreshToken: string } | null) => void

let getAuth: AuthGetter = () => ({ accessToken: null, refreshToken: null })
let setAuth: AuthSetter = () => {}

export function configureApiClient(getter: AuthGetter, setter: AuthSetter) {
  getAuth = getter
  setAuth = setter
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getAuth()
  if (!refreshToken) return null

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    setAuth(null)
    return null
  }

  const data = (await response.json()) as AuthResponse
  setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  return data.accessToken
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const { accessToken } = getAuth()
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiFetch<T>(path, options, false)
    }
  }

  if (!response.ok) {
    let message = `API error: ${response.status}`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
