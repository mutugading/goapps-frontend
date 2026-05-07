// TanStack Query hooks for notifications.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  ListNotificationsParams,
} from "@/services/iam/notification-api"

export const notificationKeys = {
  all: ["iam", "notifications"] as const,
  lists: () => ["iam", "notifications", "list"] as const,
  list: (params: ListNotificationsParams) => ["iam", "notifications", "list", JSON.stringify(params)] as const,
  unreadCount: () => ["iam", "notifications", "unread-count"] as const,
}

export function useNotifications(params: ListNotificationsParams = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => listNotifications(params),
    staleTime: 15_000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 10_000,
    // Fall back to polling if SSE disconnects — short interval is fine
    // because the endpoint is a single COUNT(*).
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useArchiveNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: archiveNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
