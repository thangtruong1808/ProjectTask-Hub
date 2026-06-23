import { useEffect, useState } from 'react'
import type { UserRole } from '../api/client'
import {
  AUDIT_ACTION_OPTIONS,
  getAuditEvents,
  type AuditEventListResponse,
} from '../api/audit'
import DashboardPageHeader from '../components/dashboard/DashboardPageHeader'
import AuditActivityFeed from '../components/dashboard/AuditActivityFeed'
import { ClockIcon } from '../components/icons/Icons'
import Spinner from '../components/Spinner'
import TablePagination from '../components/TablePagination'
import { usePageDocumentTitle } from '../hooks/useDocumentTitle'

const ROLE_OPTIONS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'User', label: 'User' },
  { value: 'ProjectManager', label: 'Project Manager' },
  { value: 'Admin', label: 'Admin' },
]

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const

export default function DashboardAuditPage() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [actorRole, setActorRole] = useState<UserRole | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [data, setData] = useState<AuditEventListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  usePageDocumentTitle('auditLog', loading && data === null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getAuditEvents({
      search,
      action: action || undefined,
      actorRole,
      page,
      pageSize,
    })
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load audit events.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [search, action, actorRole, page, pageSize])

  const totalItems = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  function handlePageSizeChange(size: number) {
    setPageSize(size)
    setPage(1)
  }

  return (
    <div className="flex min-h-full flex-1 flex-col space-y-6">
      <DashboardPageHeader
        icon={<ClockIcon size={24} />}
        title="Audit log"
        subtitle="Review actions performed by every role across the workspace."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="audit-search" className="mb-1 block text-xs font-medium text-slate-600">
              Search
            </label>
            <input
              id="audit-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search summary, actor, project..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="audit-action" className="mb-1 block text-xs font-medium text-slate-600">
              Action
            </label>
            <select
              id="audit-action"
              value={action}
              onChange={(e) => {
                setAction(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All actions</option>
              {AUDIT_ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audit-role" className="mb-1 block text-xs font-medium text-slate-600">
              Actor role
            </label>
            <select
              id="audit-role"
              value={actorRole}
              onChange={(e) => {
                setActorRole(e.target.value as UserRole | '')
                setPage(1)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative p-4 sm:p-5">
          {loading && (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/70 pt-10 backdrop-blur-[1px]"
              aria-live="polite"
              aria-busy="true"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
                <Spinner size="sm" label="Loading audit events" />
                Loading audit events...
              </span>
            </div>
          )}
          <AuditActivityFeed compact={false} items={data?.items} loading={loading} />
        </div>

        {data && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            disabled={loading}
          />
        )}
      </div>
    </div>
  )
}
