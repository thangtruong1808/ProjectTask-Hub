import { TASK_STATUSES, type TaskStatus } from '../../api/todos'
import type { ProjectItem } from '../../api/projects'
import { MagnifyingGlassIcon } from '../icons/Icons'
import Spinner from '../Spinner'
import { STATUS_LABELS } from './taskConstants'
import { selectClass } from './taskStyles'

interface TasksFiltersPanelProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  statusFilter: TaskStatus | ''
  onStatusFilterChange: (value: TaskStatus | '') => void
  projectFilter: number | ''
  onProjectFilterChange: (value: number | '') => void
  projects: ProjectItem[]
  projectsLoading: boolean
  loading: boolean
  tasksCount: number
  isSearchDebouncing: boolean
  isFilterLoading: boolean
  hasActiveFilters: boolean
  onClearFilters: () => void
  onPageReset: () => void
}

export default function TasksFiltersPanel({
  searchInput,
  onSearchInputChange,
  statusFilter,
  onStatusFilterChange,
  projectFilter,
  onProjectFilterChange,
  projects,
  projectsLoading,
  loading,
  tasksCount,
  isSearchDebouncing,
  isFilterLoading,
  hasActiveFilters,
  onClearFilters,
  onPageReset,
}: TasksFiltersPanelProps) {
  return (
    <section
      className="relative mb-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4"
      aria-label="Task filters"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-700">Filters</h2>
        <div className="flex flex-wrap items-center gap-2">
          {(isSearchDebouncing || isFilterLoading) && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600">
              <Spinner size="sm" label="Applying filters" />
              {isSearchDebouncing ? 'Searching...' : 'Updating results...'}
            </span>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              disabled={loading}
              className="text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-60"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-5">
          <label htmlFor="task-search" className="mb-1 block text-sm font-medium text-slate-600">
            Search by name
          </label>
          <div className="relative">
            <MagnifyingGlassIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="task-search"
              type="search"
              value={searchInput}
              onChange={(e) => {
                onSearchInputChange(e.target.value)
                onPageReset()
              }}
              placeholder="Search tasks..."
              className={`w-full rounded-lg border border-slate-300 py-2 pl-9 pr-10 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${isSearchDebouncing ? 'border-blue-200 bg-blue-50/30' : 'bg-white'}`}
            />
            {isSearchDebouncing && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" label="Searching tasks" />
              </span>
            )}
          </div>
        </div>

        <div className="sm:col-span-1 lg:col-span-3">
          <label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-slate-600">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value
              onStatusFilterChange(value === '' ? '' : (value as TaskStatus))
              onPageReset()
            }}
            disabled={loading && tasksCount === 0}
            className={`${selectClass} ${isFilterLoading ? 'border-blue-200 bg-blue-50/30' : 'bg-white'}`}
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1 lg:col-span-4">
          <label htmlFor="project-filter" className="mb-1 block text-sm font-medium text-slate-600">
            Project
          </label>
          <div className="relative">
            {(projectsLoading || isFilterLoading) && (
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <Spinner
                  size="sm"
                  label={projectsLoading ? 'Loading projects' : 'Loading tasks'}
                />
              </span>
            )}
            <select
              id="project-filter"
              value={projectFilter}
              onChange={(e) => {
                const value = e.target.value
                onProjectFilterChange(value === '' ? '' : Number(value))
                onPageReset()
              }}
              disabled={projectsLoading}
              className={`${selectClass} ${projectsLoading || isFilterLoading ? 'border-blue-200 bg-blue-50/30 pr-10' : 'bg-white'}`}
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.code ? `${project.code} — ${project.name}` : project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}
