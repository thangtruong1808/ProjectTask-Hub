import { useEffect, useState } from 'react'
import type { UserDto, UserRole } from '../api/client'
import {
  assignProjectMember,
  getProjectMembers,
  memberDisplayName,
  memberRoleLabel,
  removeProjectMember,
  type ProjectMemberItem,
} from '../api/projects'
import { FolderIcon, UserPlusIcon, UsersIcon, XMarkIcon } from './icons/Icons'
import Spinner from './Spinner'
import UserSearchPicker from './UserSearchPicker'

interface ProjectMembersPanelProps {
  projectId: number
  projectLabel: string
  assignableUsers?: UserDto[]
  onMembersChanged?: () => void
}

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

export default function ProjectMembersPanel({
  projectId,
  projectLabel,
  onMembersChanged,
}: ProjectMembersPanelProps) {
  const [members, setMembers] = useState<ProjectMemberItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
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

  const memberIds = members.map((m) => m.userId)

  async function handleAssign() {
    if (!selectedUser) return
    setAssigning(true)
    setError(null)
    try {
      await assignProjectMember(projectId, selectedUser.id)
      const data = await getProjectMembers(projectId)
      setMembers(data)
      setSelectedUser(null)
      onMembersChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not assign user to project.')
    } finally {
      setAssigning(false)
    }
  }

  async function handleRemove(userId: number) {
    setRemovingUserId(userId)
    setError(null)
    try {
      await removeProjectMember(projectId, userId)
      setMembers((current) => current.filter((m) => m.userId !== userId))
      onMembersChanged?.()
    } catch (err) {
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

      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
          <Spinner size="sm" label="Loading project members" />
          Loading members...
        </div>
      ) : (
        <>
          {members.length === 0 ? (
            <p className="mb-3 text-sm text-slate-500">No users assigned to this project yet.</p>
          ) : (
            <ul className="mb-3 space-y-2">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white bg-white px-3 py-2 shadow-sm"
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
                    <button
                      type="button"
                      onClick={() => handleRemove(member.userId)}
                      disabled={removingUserId === member.userId}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-70"
                      aria-label={`Remove ${memberDisplayName(member)}`}
                    >
                      {removingUserId === member.userId ? (
                        <Spinner size="sm" label="Removing member" />
                      ) : (
                        <XMarkIcon size={13} />
                      )}
                      Remove
                    </button>
                  </div>
                </li>
              ))}
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
