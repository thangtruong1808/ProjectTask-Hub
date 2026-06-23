import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ChartIcon, XMarkIcon } from '../icons/Icons'
import { DashboardNavLinks } from './AuditActivityFeed'

function useDashboardShellHeight() {
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const header = document.querySelector('header')
    if (!header) return

    function updateHeight() {
      setHeight(window.innerHeight - header!.getBoundingClientRect().height)
    }

    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(header)
    window.addEventListener('resize', updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return height
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const shellHeight = useDashboardShellHeight()

  useEffect(() => {
    document.documentElement.classList.add('dashboard-shell', 'scrollbar-none')
    document.body.classList.add('dashboard-shell')

    return () => {
      document.documentElement.classList.remove('dashboard-shell', 'scrollbar-none')
      document.body.classList.remove('dashboard-shell')
    }
  }, [])

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <div
      className="relative -mx-4 -mt-8 -mb-8 flex w-[calc(100%+2rem)] max-w-none overflow-hidden bg-slate-100 sm:-mx-6 sm:w-[calc(100%+3rem)]"
      style={shellHeight ? { height: `${shellHeight}px` } : { minHeight: 'calc(100dvh - 3.5rem)' }}
    >
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:max-w-none lg:h-full lg:shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Dashboard</p>
            <p className="text-xs text-slate-500">Admin console</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ChartIcon size={16} />
          </span>
        </div>

        <button
          type="button"
          onClick={closeMobile}
          className="mx-4 mt-3 inline-flex items-center gap-1 self-end rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 lg:hidden"
        >
          <XMarkIcon size={14} />
          Close
        </button>

        <div className="px-3 py-4">
          <DashboardNavLinks onNavigate={closeMobile} />
        </div>
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col bg-slate-100">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div>
            <p className="text-sm font-semibold text-slate-900">Admin Dashboard</p>
            <p className="text-xs text-slate-500">Overview, users, and audit</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
          >
            <ChartIcon size={16} />
            Menu
          </button>
        </div>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-slate-100">
          <div className="flex min-h-full flex-col px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
