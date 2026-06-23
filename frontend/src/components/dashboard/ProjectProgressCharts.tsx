import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  completionPercent,
  getProjectProgress,
  getProjectProgressById,
  projectDisplayLabel,
  type ProjectProgressItem,
} from '../../api/dashboard'
import Spinner from '../Spinner'

const STATUS_COLORS = {
  pending: '#94a3b8',
  inProgress: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

function projectChartLabel(item: ProjectProgressItem) {
  const label = projectDisplayLabel(item)
  return label.length > 22 ? `${label.slice(0, 20)}…` : label
}

export default function ProjectProgressCharts() {
  const [projects, setProjects] = useState<ProjectProgressItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [selectedProject, setSelectedProject] = useState<ProjectProgressItem | null>(null)
  const [loadingAll, setLoadingAll] = useState(true)
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoadingAll(true)
    setError(null)
    getProjectProgress()
      .then((data) => {
        setProjects(data)
        if (data.length > 0) {
          setSelectedProjectId(data[0].projectId)
        }
      })
      .catch(() => setError('Could not load project progress.'))
      .finally(() => setLoadingAll(false))
  }, [])

  useEffect(() => {
    if (selectedProjectId === '') {
      setSelectedProject(null)
      return
    }

    let cancelled = false
    setLoadingSingle(true)
    getProjectProgressById(Number(selectedProjectId))
      .then((data) => {
        if (!cancelled) setSelectedProject(data)
      })
      .catch(() => {
        if (!cancelled) setSelectedProject(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingSingle(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedProjectId])

  const stackedData = useMemo(
    () =>
      projects.map((item) => ({
        name: projectChartLabel(item),
        pending: item.pending,
        inProgress: item.inProgress,
        completed: item.completed,
        cancelled: item.cancelled,
      })),
    [projects],
  )

  const pieData = useMemo(() => {
    if (!selectedProject) return []
    return [
      { name: 'Pending', value: selectedProject.pending, color: STATUS_COLORS.pending },
      { name: 'In Progress', value: selectedProject.inProgress, color: STATUS_COLORS.inProgress },
      { name: 'Completed', value: selectedProject.completed, color: STATUS_COLORS.completed },
      { name: 'Cancelled', value: selectedProject.cancelled, color: STATUS_COLORS.cancelled },
    ].filter((item) => item.value > 0)
  }, [selectedProject])

  if (loadingAll) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
          <Spinner size="sm" label="Loading charts" />
          Loading charts...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">All projects progress</h2>
        <p className="mb-4 text-sm text-slate-500">Task status breakdown across active projects.</p>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No active projects with task data.</p>
        ) : (
          <div className="h-72 w-full min-w-0 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} name="Pending" />
                <Bar dataKey="inProgress" stackId="a" fill={STATUS_COLORS.inProgress} name="In Progress" />
                <Bar dataKey="completed" stackId="a" fill={STATUS_COLORS.completed} name="Completed" />
                <Bar dataKey="cancelled" stackId="a" fill={STATUS_COLORS.cancelled} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Single project</h2>
            <p className="text-sm text-slate-500">Drill into one project&apos;s completion mix.</p>
          </div>
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            {loadingSingle && (
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <Spinner size="sm" label="Loading project chart" />
              </span>
            )}
            <select
              value={selectedProjectId}
              onChange={(e) =>
                setSelectedProjectId(e.target.value === '' ? '' : Number(e.target.value))
              }
              disabled={projects.length === 0 || loadingSingle}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                loadingSingle ? 'border-blue-200 bg-blue-50/40 pr-10' : 'bg-white'
              }`}
            >
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {projectDisplayLabel(project)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingSingle ? (
          <div className="flex min-h-[14rem] items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
              <Spinner size="sm" label="Updating chart" />
              Updating chart...
            </span>
          </div>
        ) : selectedProject && pieData.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Completion
              </p>
              <p className="mt-1 text-3xl font-semibold text-green-700">
                {completionPercent(selectedProject)}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedProject.completed} of {selectedProject.total} tasks
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No tasks in this project yet.</p>
        )}
      </div>
    </div>
  )
}
