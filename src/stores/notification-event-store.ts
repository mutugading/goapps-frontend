import { create } from "zustand"
import type { Notification } from "@/types/iam/notification"

type Listener = (n: Notification) => void

// Internal listener set stored outside Zustand state to avoid re-render cascades.
const listeners = new Set<Listener>()

interface NotificationEventStore {
  lastEvent: Notification | null
  subscribe: (fn: Listener) => () => void
  dispatch: (n: Notification) => void
}

export const useNotificationEventStore = create<NotificationEventStore>(() => ({
  lastEvent: null,
  subscribe: (fn: Listener) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  dispatch: (n: Notification) => {
    useNotificationEventStore.setState({ lastEvent: n })
    listeners.forEach((fn) => fn(n))
  },
}))
