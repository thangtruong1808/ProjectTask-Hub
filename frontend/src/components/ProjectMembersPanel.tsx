import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import type { UserDto, UserRole } from '../api/client'
import type { RootState } from '../store'
import {
  assignProjectMember,
  getProjectMembers,
  memberDisplayName,
  memberRoleLabel,
  removeProjectMember,
  type ProjectMemberItem,
} from '../api/projects'
import { FolderIcon, UserPlusIcon, UsersIcon, XMarkIcon } from './icons/Icons'
import InlineMessage from './InlineMessage'
import Spinner from './Spinner'
import UserSearchPicker from './UserSearchPicker'

interface ProjectMembersPanelProps {
  projectId: number
  projectLabel: string
  assignableUsers?: UserDto[]
  onMembersChanged?: () => void
}

const SUCCESS_DISMISS_MS = 4000

const MEMBER_ROLE_STYLES: Record<UserRole, string> = {
  User: 'bg-slate-100 text-slate-600',
  ProjectManager: 'bg-amber-100 text-amber-800',
  Admin: 'bg-blue-100 text-blue-800',
}

function formatAssignedAt(value: string) {
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

function canRemoveMember(
  member: ProjectMemberItem,
  currentUserId: number | undefined,
  currentUserRole: UserRole | undefined,
): boolean {
  if (!currentUserId || !currentUserRole) {
    return false
  }

  if (currentUserRole === 'Admin') {
    return member.userId !== currentUserId
  }

  if (currentUserRole === 'ProjectManager') {
    if (member.userId === currentUserId) {
      return false
    }

    return member.role === 'User'
  }

  return false
}

export default function ProjectMembersPanel({
  projectId,
  projectLabel,
  onMembersChanged,
}: ProjectMembersPanelProps) {
  const currentUser = useSelector((s: RootState) => s.auth.user)
  const [members, setMembers] = useState<ProjectMemberItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    setSelectedUser(null)
    getProjectMembers(projectId)
      .then((data) => {
        if (!cancelled) setMembers(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load project members.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, SUCCESS_DISMISS_MS)

    return () => window.clearTimeout(timer)
  }, [successMessage])

  const memberIds = members.map((m) => m.userId)

  function showSuccess(message: string) {
    setSuccessMessage(message)
    setError(null)
  }

  async function handleAssign() {
    if (!selectedUser) return
    const assignedUser = selectedUser
    setAssigning(true)
    setError(null)
    try {
      await assignProjectMember(projectId, assignedUser.id)
      const data = await getProjectMembers(projectId)
      setMembers(data)
      setSelectedUser(null)
      onMembersChanged?.()
      showSuccess(`"${memberDisplayName(assignedUser)}" added to project team successfully.`)
    } catch (err) {
      setSuccessMessage(null)
      setError(err instanceof Error ? err.message : 'Could not assign user to project.')
    } finally {
      setAssigning(false)
    }
  }

  async function handleRemove(userId: number) {
    const removedMember = members.find((member) => member.userId === userId)
    setRemovingUserId(userId)
    setError(null)
    try {
      await removeProjectMember(projectId, userId)
      setMembers((current) => current.filter((m) => m.userId !== userId))
      onMembersChanged?.()
      if (removedMember) {
        showSuccess(`"${memberDisplayName(removedMember)}" removed from project team successfully.`)
      } else {
        showSuccess('User removed from project team successfully.')
      }
    } catch (err) {
      setSuccessMessage(null)
      setError(err instanceof Error ? err.message : 'Could not remove user from project.')
    } finally {
      setRemovingUserId(null)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <UsersIcon size={16} className="text-blue-600" />
          Project team
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">
          <FolderIcon size={13} />
          {projectLabel}
        </span>
      </div>

      {successMessage && (
        <InlineMessage
          variant="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {error && (
        <InlineMessage
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {loading ? (
        <div className="flex min-h-[5rem] items-center justify-center py-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
            <Spinner size="sm" label="Loading project members" />
            Loading members...
          </span>
        </div>
      ) : (
        <>
          {members.length === 0 ? (
            <p className="mb-3 text-sm text-slate-500">No users assigned to this project yet.</p>
          ) : (
            <ul className="mb-3 space-y-2">
              {members.map((member) => {
                const isRemoving = removingUserId === member.userId
                const showRemove = canRemoveMember(member, currentUser?.id, currentUser?.role)

                return (
                <li
                  key={member.userId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white bg-white px-3 py-2 shadow-sm"
                  aria-busy={isRemoving}
                >
                  <div className="min-w-0">
                    <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-medium text-slate-900">
                      <span className="truncate">{memberDisplayName(member)}</span>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${MEMBER_ROLE_STYLES[member.role]}`}
                      >
                        {memberRoleLabel(member.role)}
                      </span>
                    </p>
                    <p className="truncate text-xs text-slate-500">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      {formatAssignedAt(member.assignedAt)}
                    </span>
                    {showRemove && (
                      <button
                        type="button"
                        onClick={() => handleRemove(member.userId)}
                        disabled={isRemoving}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label={`Remove ${memberDisplayName(member)}`}
                      >
                        {isRemoving ? (
                          <>
                            <Spinner size="sm" label="Removing member" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <XMarkIcon size={13} />
                            Remove
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </li>
                )
              })}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="project-member-search" className="mb-1 block text-xs font-medium text-slate-600">
                Assign user
              </label>
              <UserSearchPicker
                inputId="project-member-search"
                selectedUser={selectedUser}
                onSelect={setSelectedUser}
                excludeUserIds={memberIds}
                disabled={assigning}
              />
            </div>
            <button
              type="button"
              onClick={handleAssign}
              disabled={assigning || !selectedUser}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {assigning ? (
                <>
                  <Spinner size="sm" label="Assigning user" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlusIcon size={16} />
                  Assign
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
