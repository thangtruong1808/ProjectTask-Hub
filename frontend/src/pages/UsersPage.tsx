import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import type { UserRole } from '../api/client'
import {
  getAdminUsers,
  ROLE_OPTIONS,
  updateUserRole,
  userDisplayName,
  type UserListItem,
} from '../api/users'
import DashboardLoadingPanel from '../components/dashboard/DashboardLoadingPanel'
import DashboardPageHeader from '../components/dashboard/DashboardPageHeader'
import InlineMessage from '../components/InlineMessage'
import {
  BriefcaseIcon,
  EmailIcon,
  PhoneIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from '../components/icons/Icons'
import Spinner from '../components/Spinner'
import type { RootState } from '../store'
import { usePageDocumentTitle } from '../hooks/useDocumentTitle'

const ROLE_STYLES: Record<UserRole, string> = {
  User: 'bg-slate-100 text-slate-700',
  ProjectManager: 'bg-amber-100 text-amber-800',
  Admin: 'bg-blue-100 text-blue-800',
}

function RoleIcon({ role, size = 14 }: { role: UserRole; size?: number }) {
  if (role === 'Admin') return <ShieldIcon size={size} />
  if (role === 'ProjectManager') return <BriefcaseIcon size={size} />
  return <UserIcon size={size} />
}

function formatDate(value: string) {
  const normalized = value.trim()
  const date = normalized.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(normalized)
    ? new Date(normalized)
    : new Date(`${normalized.replace(' ', 'T')}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const selectClass =
  'w-full min-w-[9rem] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100'

function RoleSelect({
  user,
  isSelf,
  isUpdating,
  onChange,
}: {
  user: UserListItem
  isSelf: boolean
  isUpdating: boolean
  onChange: (role: UserRole) => void
}) {
  return (
    <div className="relative w-full min-w-[9rem]">
      <select
        value={user.role}
        onChange={(e) => onChange(e.target.value as UserRole)}
        disabled={isSelf || isUpdating}
        className={`${selectClass} ${isUpdating ? 'border-blue-200 bg-blue-50/40' : ''}`}
        aria-label={`Role for ${userDisplayName(user)}`}
        aria-busy={isUpdating}
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isUpdating && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]"
          aria-hidden="true"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm">
            <Spinner size="sm" label="Updating role" />
            Saving...
          </span>
        </div>
      )}
    </div>
  )
}

export default function UsersPage() {
  const currentUser = useSelector((s: RootState) => s.auth.user)
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  usePageDocumentTitle('userManagement', loading && users.length === 0)

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false
      if (!query) return true
      const name = userDisplayName(user).toLowerCase()
      return name.includes(query) || user.email.toLowerCase().includes(query)
    })
  }, [users, searchQuery, roleFilter])

  async function handleRoleChange(user: UserListItem, newRole: UserRole) {
    if (user.role === newRole) return
    if (currentUser?.id === user.id) {
      setError('You cannot change your own role.')
      setSuccessMessage(null)
      return
    }

    setUpdatingId(user.id)
    setError(null)
    try {
      const updated = await updateUserRole(user.id, newRole)
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, role: updated.role }
            : item,
        ),
      )
      setSuccessMessage(`Role updated for ${userDisplayName(user)}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update role.')
      setSuccessMessage(null)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col space-y-6">
        <DashboardPageHeader
          icon={<UsersIcon size={24} />}
          title="User management"
          subtitle="View workspace members and assign roles with confidence."
        />
        <DashboardLoadingPanel label="Loading users..." hint="Please wait a moment" />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col space-y-6">
      <DashboardPageHeader
        icon={<UsersIcon size={24} />}
        title="User management"
        subtitle="View workspace members and assign roles with confidence."
      />

      {successMessage && (
        <InlineMessage
          variant="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {error && (
        <InlineMessage variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="user-search" className="mb-1 block text-sm font-medium text-slate-600">
              Search
            </label>
            <input
              id="user-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="w-full sm:w-48">
            <label htmlFor="role-filter" className="mb-1 block text-sm font-medium text-slate-600">
              Role
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className={selectClass}
            >
              <option value="">All roles</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}
        </p>

        <div className="space-y-3 md:hidden">
          {filteredUsers.length === 0 ? (
            <p className="rounded-xl border border-slate-200 px-4 py-10 text-center text-slate-500">
              No users match your filters.
            </p>
          ) : (
            filteredUsers.map((user) => {
              const isSelf = currentUser?.id === user.id
              const isUpdating = updatingId === user.id
              return (
                <article
                  key={user.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{userDisplayName(user)}</p>
                    {isSelf && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        You
                      </span>
                    )}
                  </div>
                  <p className="mb-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <EmailIcon size={14} />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500">
                      <PhoneIcon size={14} />
                      {user.phone}
                    </p>
                  )}
                  <p className="mb-3 text-xs text-slate-400">Joined {formatDate(user.createdAt)}</p>

                  <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role]}`}
                    >
                      <RoleIcon role={user.role} size={12} />
                      {ROLE_OPTIONS.find((o) => o.value === user.role)?.label ?? user.role}
                    </span>
                  </div>
                  <div className="mt-2">
                    <RoleSelect
                      user={user}
                      isSelf={isSelf}
                      isUpdating={isUpdating}
                      onChange={(role) => handleRoleChange(user, role)}
                    />
                  </div>
                  {isSelf && (
                    <p className="mt-1 text-xs text-slate-500">Cannot change your own role.</p>
                  )}
                </article>
              )
            })
          )}
        </div>

        <div className="hidden min-w-0 rounded-xl border border-slate-200 md:block">
          <div className="scrollbar-none overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = currentUser?.id === user.id
                  const isUpdating = updatingId === user.id
                  return (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {userDisplayName(user)}
                          </span>
                          {isSelf && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-500">{user.phone || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <RoleSelect
                          user={user}
                          isSelf={isSelf}
                          isUpdating={isUpdating}
                          onChange={(role) => handleRoleChange(user, role)}
                        />
                        {isSelf && (
                          <p className="mt-1 text-xs text-slate-500">Cannot change your own role.</p>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}
