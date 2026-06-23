import { useEffect, useState } from 'react'
import { getDashboardStats, type DashboardStats } from '../api/dashboard'
import DashboardLoadingPanel from '../components/dashboard/DashboardLoadingPanel'
import DashboardPageHeader from '../components/dashboard/DashboardPageHeader'
import ProjectProgressCharts from '../components/dashboard/ProjectProgressCharts'
import { ChartIcon, ClipboardIcon, UsersIcon } from '../components/icons/Icons'
import InlineMessage from '../components/InlineMessage'
import { usePageDocumentTitle } from '../hooks/useDocumentTitle'

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  usePageDocumentTitle('dashboardOverview', loading)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setError('Could not load dashboard stats.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col space-y-6">
        <DashboardPageHeader
          icon={<ChartIcon size={24} />}
          title="Dashboard overview"
          subtitle="Workspace metrics and project progress at a glance."
        />
        <DashboardLoadingPanel label="Loading dashboard..." hint="Fetching stats and charts" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <InlineMessage variant="error" message={error ?? 'No data'} onDismiss={() => setError(null)} />
    )
  }

  const statusCards = [
    { label: 'Pending', value: stats.pendingTasks, color: 'bg-slate-100 text-slate-800', icon: <ClipboardIcon size={18} /> },
    { label: 'In Progress', value: stats.inProgressTasks, color: 'bg-blue-100 text-blue-800', icon: <ChartIcon size={18} /> },
    { label: 'Completed', value: stats.completedTasks, color: 'bg-green-100 text-green-800', icon: <ChartIcon size={18} /> },
    { label: 'Cancelled', value: stats.cancelledTasks, color: 'bg-red-100 text-red-800', icon: <ClipboardIcon size={18} /> },
  ]

  return (
    <div className="flex min-h-full flex-1 flex-col space-y-6">
      <DashboardPageHeader
        icon={<ChartIcon size={24} />}
        title="Dashboard overview"
        subtitle="Workspace metrics and project progress at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <ClipboardIcon size={18} />
            <p className="text-sm">Total tasks</p>
          </div>
          <p className="text-3xl font-semibold text-slate-900">{stats.totalTasks}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <UsersIcon size={18} />
            <p className="text-sm">Total users</p>
          </div>
          <p className="text-3xl font-semibold text-slate-900">{stats.totalUsers}</p>
        </div>
        {statusCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              {card.icon}
              <p className="text-sm">{card.label}</p>
            </div>
            <p className={`inline-flex rounded-full px-3 py-1 text-2xl font-semibold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <ProjectProgressCharts />
    </div>
  )
}
