import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: string
  className?: string
  variant?: 'plain' | 'card'
}

export default function PageHeader({
  icon,
  title,
  subtitle,
  className = '',
  variant = 'plain',
}: PageHeaderProps) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{subtitle}</p>
        )}
      </div>
    </div>
  )

  if (variant === 'card') {
    return (
      <div
        className={`mb-6 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5 ${className}`}
      >
        {content}
      </div>
    )
  }

  return <div className={`mb-6 ${className}`}>{content}</div>
}
