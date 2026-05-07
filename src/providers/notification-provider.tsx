"use client"

// NotificationProvider — opens a long-lived EventSource to /api/v1/iam/notifications/stream
// when the user is authenticated, and pushes incoming notifications into the
// TanStack Query cache so the bell + dropdown update without polling.
//
// EventSource handles automatic reconnect and Last-Event-ID resume natively.

import { createContext, useContext, useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuth } from "./auth-provider"
import { notificationKeys } from "@/hooks/iam/use-notifications"
import {
  Notification,
  normalizeNotification,
  RawNotification,
  NotificationSeverity,
  typeLabel,
} from "@/types/iam/notification"

interface NotificationContextValue {
  // Status of the SSE connection.
  connected: boolean
}

const NotificationContext = createContext<NotificationContextValue>({ connected: false })

interface ProviderProps {
  children: React.ReactNode
}

interface RawStreamEvent {
  eventId?: string
  event_id?: string
  notification?: RawNotification | null
  isHeartbeat?: boolean
  is_heartbeat?: boolean
}

export function NotificationProvider({ children }: ProviderProps) {
  const { isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      // Tear down any existing connection on logout.
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
      return
    }

    // Open SSE.
    const es = new EventSource("/api/v1/iam/notifications/stream", { withCredentials: true })
    esRef.current = es

    const handleEvent = (raw: RawStreamEvent) => {
      const isHeartbeat = raw.isHeartbeat ?? raw.is_heartbeat ?? false
      if (isHeartbeat) return
      if (!raw.notification) return
      const n: Notification = normalizeNotification(raw.notification)

      // Refresh the unread count + lists.
      qc.invalidateQueries({ queryKey: notificationKeys.all })

      // Surface a transient toast — severity-driven.
      const title = `${typeLabel(n.type)}: ${n.title}`
      switch (n.severity) {
        case NotificationSeverity.NOTIFICATION_SEVERITY_SUCCESS:
          toast.success(title, { description: n.body })
          break
        case NotificationSeverity.NOTIFICATION_SEVERITY_WARNING:
          toast.warning(title, { description: n.body })
          break
        case NotificationSeverity.NOTIFICATION_SEVERITY_ERROR:
          toast.error(title, { description: n.body })
          break
        default:
          toast.message(title, { description: n.body })
      }
    }

    const onMessage = (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data) as RawStreamEvent
        handleEvent(parsed)
      } catch (err) {
        console.error("notification stream parse error", err)
      }
    }

    // Backend uses `event: notification`; some browsers also fire generic 'message'.
    es.addEventListener("notification", onMessage as EventListener)
    es.onmessage = onMessage

    es.onerror = () => {
      // EventSource auto-reconnects with exponential backoff; we just log here.
      // Do NOT close the EventSource — let the browser handle reconnect.
      // In dev with HMR you may see one transient error; that's expected.
    }

    return () => {
      es.removeEventListener("notification", onMessage as EventListener)
      es.close()
      if (esRef.current === es) esRef.current = null
    }
  }, [isAuthenticated, qc])

  return (
    <NotificationContext.Provider value={{ connected: esRef.current !== null }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationConnection(): NotificationContextValue {
  return useContext(NotificationContext)
}
