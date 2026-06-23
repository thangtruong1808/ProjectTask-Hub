import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardIcon } from '../icons/Icons'

interface AuthCardProps {
  title: string
  subtitle?: string
  titleIcon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export default function AuthCard({
  title,
  subtitle,
  titleIcon,
  children,
  footer,
  wide = false,
}: AuthCardProps) {
  return (
    <div className={`mx-auto w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          to="/login"
          className="group mb-6 flex items-center justify-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="ProjectTask-Hub — go to sign in"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <ClipboardIcon size={22} />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-lg font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700">
              ProjectTask-Hub
            </span>
            <span className="block text-xs text-slate-500">Task & project management</span>
          </span>
        </Link>

        <div className="mb-6 border-t border-slate-100 pt-6 text-center">
          <h1 className="inline-flex items-center justify-center gap-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {titleIcon && (
              <span className="inline-flex text-blue-600" aria-hidden="true">
                {titleIcon}
              </span>
            )}
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-600">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>

      {footer && <div className="mt-5 text-center text-sm text-slate-600">{footer}</div>}
    </div>
  )
}
