import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  auditActionLabel,
  formatAuditTime,
  getAuditEvents,
  type AuditEventItem,
} from '../../api/audit'
import { ChartIcon, ClipboardIcon, UsersIcon } from '../icons/Icons'
import Spinner from '../Spinner'

const ROLE_STYLES: Record<string, string> = {
  User: 'bg-slate-100 text-slate-600',
  ProjectManager: 'bg-amber-100 text-amber-800',
  Admin: 'bg-blue-100 text-blue-800',
}

interface AuditActivityFeedProps {
  compact?: boolean
  limit?: number
  refreshToken?: number
  items?: AuditEventItem[]
  loading?: boolean
}

export default function AuditActivityFeed({
  compact = false,
  limit = 12,
  refreshToken = 0,
  items: externalItems,
  loading: externalLoading,
}: AuditActivityFeedProps) {
  const [items, setItems] = useState<AuditEventItem[]>([])
  const [loading, setLoading] = useState(externalItems === undefined)
  const [error, setError] = useState<string | null>(null)

  const displayItems = externalItems ?? items
  const displayLoading = externalLoading ?? loading

  useEffect(() => {
    if (externalItems !== undefined) {
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    getAuditEvents({ page: 1, pageSize: limit })
      .then((data) => {
        if (!cancelled) setItems(data.items)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load activity.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [limit, refreshToken, externalItems])

  if (displayLoading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'py-6' : 'py-10'}`}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
          <Spinner size="sm" label="Loading activity" />
          Loading activity...
        </span>
      </div>
    )
  }

  if (error) {
    return <p className="text-xs text-red-600">{error}</p>
  }

  if (displayItems.length === 0) {
    return (
      <p className={`text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
        No activity recorded yet.
      </p>
    )
  }

  return (
    <ul className={compact ? 'space-y-2' : 'space-y-3'}>
      {displayItems.map((item) => (
        <li
          key={item.id}
          className={`rounded-lg border border-slate-200 bg-white ${
            compact ? 'px-2.5 py-2' : 'px-3 py-3 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium text-slate-900 ${compact ? 'text-xs' : 'text-sm'}`}>
              {item.summary}
            </p>
          </div>
          <div className={`mt-1 flex flex-wrap items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'} text-slate-500`}>
            <span className="font-medium text-slate-600">{item.actorFullName}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 font-medium ${ROLE_STYLES[item.actorRole] ?? 'bg-slate-100 text-slate-600'}`}
            >
              {item.actorRole}
            </span>
            <span className="text-slate-300">·</span>
            <span>{auditActionLabel(item.action)}</span>
            <span className="text-slate-300">·</span>
            <span>{formatAuditTime(item.createdAt)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function DashboardNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <nav className="space-y-1">
      <NavLink to="/dashboard" end className={linkClass} onClick={onNavigate}>
        <ChartIcon size={16} />
        Overview
      </NavLink>
      <NavLink to="/dashboard/users" className={linkClass} onClick={onNavigate}>
        <UsersIcon size={16} />
        Users
      </NavLink>
      <NavLink to="/dashboard/audit" className={linkClass} onClick={onNavigate}>
        <ClipboardIcon size={16} />
        Audit
      </NavLink>
    </nav>
  )
}
