"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { type CostNotification, normalizeCostNotification } from "@/types/finance/cost-notification"

const KEYS = {
  all: ["finance", "cost-notification"] as const,
  list: (unreadOnly: boolean, page: number) => ["finance", "cost-notification", "list", unreadOnly, page] as const,
  unread: ["finance", "cost-notification", "unread-count"] as const,
}

export function useMyNotifications(unreadOnly = false, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: KEYS.list(unreadOnly, page),
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (unreadOnly) qs.set("unreadOnly", "true")
      qs.set("page", String(page))
      qs.set("pageSize", String(pageSize))
      const res = await fetch(`/api/v1/finance/cost-notifications?${qs.toString()}`)
      const json = await res.json()
      return {
        items: ((json.data as unknown[]) || []).map((r) => normalizeCostNotification(r as Record<string, unknown>)),
        unreadCount: Number(json.unreadCount ?? 0),
        pagination: json.pagination,
      }
    },
    staleTime: 10_000,
    refetchInterval: 60_000, // refresh every minute
  })
}

export function useMyNotificationUnreadCount() {
  return useQuery({
    queryKey: KEYS.unread,
    queryFn: async () => {
      const res = await fetch("/api/v1/finance/cost-notifications/unread-count")
      const json = await res.json()
      return Number(json.unreadCount ?? 0)
    },
    staleTime: 10_000,
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await fetch(`/api/v1/finance/cost-notifications/${notificationId}/read`, { method: "POST" })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostNotification(json.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/finance/cost-notifications/mark-all-read", { method: "POST" })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return Number(json.updatedCount ?? 0)
    },
    onSuccess: (count) => {
      if (count > 0) toast.success(`${count} notification${count === 1 ? "" : "s"} marked read`)
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export type { CostNotification }
export const costNotificationKeys = KEYS
