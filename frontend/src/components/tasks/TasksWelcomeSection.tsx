import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { UserRole } from '../../api/client'
import type { RootState } from '../../store'
import { ClipboardIcon } from '../icons/Icons'
import LoadingBadge from '../ui/LoadingBadge'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const ROLE_WELCOME_COPY: Record<
  UserRole,
  { headline: string; message: string; loadingLabel: string }
> = {
  Admin: {
    headline: 'Your workspace command center',
    message:
      'Review tasks across all projects, keep teams aligned, and spot bottlenecks before they slow delivery.',
    loadingLabel: 'Loading workspace tasks...',
  },
  ProjectManager: {
    headline: 'Your projects, your team',
    message:
      'Monitor task progress on the projects you lead, assign work with clarity, and keep milestones on track.',
    loadingLabel: 'Loading project tasks...',
  },
  User: {
    headline: 'Your tasks, your focus',
    message:
      'See what is assigned to you, update progress as you go, and stay clear on priorities for today.',
    loadingLabel: 'Loading your tasks...',
  },
}

interface TasksWelcomeSectionProps {
  isLoading?: boolean
}

export default function TasksWelcomeSection({ isLoading = false }: TasksWelcomeSectionProps) {
  const user = useSelector((s: RootState) => s.auth.user)
  const greeting = useMemo(() => getGreeting(), [])

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [],
  )

  const role = user?.role ?? 'User'
  const copy = ROLE_WELCOME_COPY[role]
  const displayName = user?.firstName?.trim() || user?.email?.split('@')[0] || 'there'

  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/40 p-5 shadow-sm sm:p-6"
      aria-label="Welcome"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ClipboardIcon size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">{today}</p>
            <h1 className="mt-1 break-words text-xl font-semibold text-slate-900 sm:text-2xl">
              {greeting}, {displayName}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-800">{copy.headline}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{copy.message}</p>
          </div>
        </div>

        {isLoading && (
          <LoadingBadge
            label={copy.loadingLabel}
            className="shrink-0 self-start gap-2"
          />
        )}
      </div>
    </section>
  )
}
