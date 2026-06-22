import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/notifications'
import Spinner from '../Spinner'
import {
  markAllRead,
  markRead,
  setLoading,
  setNotifications,
  type AppDispatch,
  type RootState,
} from '../../store'

export default function NotificationBell() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, unreadCount, loading } = useSelector(
    (s: RootState) => s.notifications,
  )
  const [open, setOpen] = useState(false)

  async function refresh() {
    dispatch(setLoading(true))
    try {
      const data = await getNotifications()
      dispatch(
        setNotifications({
          items: data.items.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            taskId: n.taskId,
            isRead: n.isRead,
            createdAt: n.createdAt,
          })),
          unreadCount: data.unreadCount,
        }),
      )
    } finally {
      dispatch(setLoading(false))
    }
  }

  async function handleMarkRead(id: number) {
    await markNotificationRead(id)
    dispatch(markRead(id))
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead()
    dispatch(markAllRead())
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          if (!open) refresh()
        }}
        className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        aria-label="Notifications"
      >
        {loading && <Spinner size="sm" label="Loading notifications" />}
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                No notifications
              </li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-slate-50 px-3 py-2.5 text-sm ${n.isRead ? 'bg-white' : 'bg-blue-50/40'}`}
                >
                  <p className="font-medium text-slate-900">{n.title}</p>
                  <p className="text-slate-600">{n.message}</p>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="mt-1 text-xs text-blue-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
