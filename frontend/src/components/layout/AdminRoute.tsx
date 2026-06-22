import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

export default function AdminRoute() {
  const user = useSelector((s: RootState) => s.auth.user)
  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
