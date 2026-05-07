// API client for notifications. Hits BFF routes only.

import { Notification, normalizeNotification, RawNotification } from "@/types/iam/notification"

interface BFFEnvelope<T> {
  base?: { isSuccess?: boolean; statusCode?: string; message?: string; validationErrors?: unknown[] }
  data?: T
  pagination?: { currentPage: number; pageSize: number; totalItems: number | string; totalPages: number }
}

export interface ListNotificationsParams {
  page?: number
  pageSize?: number
  status?: number // proto NotificationStatus enum value
  type?: number // proto NotificationType enum value
  sortOrder?: "asc" | "desc" | ""
}

export interface ListNotificationsResult {
  items: Notification[]
  total: number
  page: number
  pageSize: number
}

export async function listNotifications(params: ListNotificationsParams = {}): Promise<ListNotificationsResult> {
  const sp = new URLSearchParams()
  sp.set("page", String(params.page ?? 1))
  sp.set("pageSize", String(params.pageSize ?? 20))
  if (params.status) sp.set("status", String(params.status))
  if (params.type) sp.set("type", String(params.type))
  if (params.sortOrder) sp.set("sortOrder", params.sortOrder)

  const res = await fetch(`/api/v1/iam/notifications?${sp.toString()}`, { credentials: "include" })
  const json = (await res.json()) as BFFEnvelope<RawNotification[]>
  const items = (json.data ?? []).map(normalizeNotification)
  const total = Number(json.pagination?.totalItems ?? items.length)
  return { items, total, page: json.pagination?.currentPage ?? 1, pageSize: json.pagination?.pageSize ?? items.length }
}

export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`/api/v1/iam/notifications/unread-count`, { credentials: "include" })
  const json = (await res.json()) as BFFEnvelope<{ unreadCount?: number }>
  return Number(json.data?.unreadCount ?? 0)
}

export async function markAsRead(id: string): Promise<void> {
  const res = await fetch(`/api/v1/iam/notifications/${encodeURIComponent(id)}/read`, {
    method: "POST",
    credentials: "include",
  })
  const json = (await res.json()) as BFFEnvelope<unknown>
  if (json.base && json.base.isSuccess === false) {
    throw new Error(json.base.message || "Failed to mark read")
  }
}

export async function markAllAsRead(): Promise<number> {
  const res = await fetch(`/api/v1/iam/notifications/read-all`, {
    method: "POST",
    credentials: "include",
  })
  const json = (await res.json()) as BFFEnvelope<{ affectedCount?: number }>
  if (json.base && json.base.isSuccess === false) {
    throw new Error(json.base.message || "Failed to mark all read")
  }
  return Number(json.data?.affectedCount ?? 0)
}

export async function archiveNotification(id: string): Promise<void> {
  const res = await fetch(`/api/v1/iam/notifications/${encodeURIComponent(id)}/archive`, {
    method: "POST",
    credentials: "include",
  })
  const json = (await res.json()) as BFFEnvelope<unknown>
  if (json.base && json.base.isSuccess === false) {
    throw new Error(json.base.message || "Failed to archive")
  }
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`/api/v1/iam/notifications/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  })
  const json = (await res.json()) as BFFEnvelope<unknown>
  if (json.base && json.base.isSuccess === false) {
    throw new Error(json.base.message || "Failed to delete")
  }
}
