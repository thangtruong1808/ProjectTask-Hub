import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { useDispatch, useSelector } from 'react-redux'
import { HUB_URL } from '../api/client'
import { getNotifications } from '../api/notifications'
import {
  addNotification,
  setLoading,
  setNotifications,
  type AppDispatch,
  type RootState,
} from '../store'

export function useSignalR() {
  const dispatch = useDispatch<AppDispatch>()
  const accessToken = useSelector((s: RootState) => s.auth.accessToken)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    if (!accessToken) {
      connectionRef.current?.stop()
      connectionRef.current = null
      return
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}?access_token=${accessToken}`)
      .withAutomaticReconnect()
      .build()

    connectionRef.current = connection

    connection.on('TaskAssigned', (payload: {
      notificationId: number
      taskId: number
      taskName: string
      message: string
      createdAt: string
    }) => {
      dispatch(
        addNotification({
          id: payload.notificationId,
          title: 'New task assigned',
          message: payload.message,
          taskId: payload.taskId,
          createdAt: payload.createdAt,
        }),
      )
    })

    connection.start().catch(() => {
      // SignalR optional fallback via polling
    })

    return () => {
      connection.stop()
    }
  }, [accessToken, dispatch])

  useEffect(() => {
    if (!accessToken) return

    async function load() {
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

    load()
    const interval = window.setInterval(load, 60000)
    return () => window.clearInterval(interval)
  }, [accessToken, dispatch])
}
