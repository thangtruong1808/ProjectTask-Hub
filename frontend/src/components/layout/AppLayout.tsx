import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout as logoutApi } from '../../api/auth'
import { useSignalR } from '../../hooks/useSignalR'
import { logout, type AppDispatch, type RootState } from '../../store'
import NotificationBell from '../notifications/NotificationBell'

export default function AppLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const user = useSelector((s: RootState) => s.auth.user)
  const refreshToken = useSelector((s: RootState) => s.auth.refreshToken)

  useSignalR()

  async function handleLogout() {
    if (refreshToken) {
      try {
        await logoutApi(refreshToken)
      } catch {
        // ignore
      }
    }
    dispatch(logout())
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            TodoList
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              Tasks
            </NavLink>
            {user?.role === 'Admin' && (
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
            )}
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
