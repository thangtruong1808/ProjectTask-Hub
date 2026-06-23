import type { ReactNode } from 'react'

interface DashboardPageHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: string
}

export default function DashboardPageHeader({
  icon,
  title,
  subtitle,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
