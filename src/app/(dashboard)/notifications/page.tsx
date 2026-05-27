"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Archive, Check, CheckCheck, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  useDeleteNotification,
} from "@/hooks/iam/use-notifications"
import {
  Notification,
  NotificationStatus,
  severityClass,
  typeLabel,
} from "@/types/iam/notification"
import { executeNotificationAction } from "@/components/iam/notifications/notification-actions"

type TabValue = "all" | "unread" | "archived"

const STATUS_BY_TAB: Record<TabValue, number> = {
  all: 0,
  unread: NotificationStatus.NOTIFICATION_STATUS_UNREAD,
  archived: NotificationStatus.NOTIFICATION_STATUS_ARCHIVED,
}

function formatDate(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

export default function NotificationsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabValue>("all")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const list = useNotifications({ page, pageSize, status: STATUS_BY_TAB[tab], sortOrder: "desc" })
  const markRead = useMarkAsRead()
  const markAllRead = useMarkAllAsRead()
  const archive = useArchiveNotification()
  const del = useDeleteNotification()

  const items = list.data?.items ?? []
  const total = list.data?.total ?? 0
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1

  const handleClick = (n: Notification) => {
    executeNotificationAction(n, router)
    if (n.status === NotificationStatus.NOTIFICATION_STATUS_UNREAD) {
      markRead.mutate(n.notificationId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">All your notifications in one place.</p>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as TabValue)
          setPage(1)
        }}
      >
        <TabsList>
          <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
          <TabsTrigger value="unread" className="cursor-pointer">Unread</TabsTrigger>
          <TabsTrigger value="archived" className="cursor-pointer">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border">
        {list.isLoading ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">No notifications.</div>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <li
                key={n.notificationId}
                role="button"
                tabIndex={0}
                className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${
                  n.status === NotificationStatus.NOTIFICATION_STATUS_UNREAD ? "bg-accent/30" : ""
                }`}
                onClick={() => handleClick(n)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault()
                    handleClick(n)
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={severityClass(n.severity)}>
                      {typeLabel(n.type)}
                    </Badge>
                    {n.status === NotificationStatus.NOTIFICATION_STATUS_UNREAD && (
                      <Badge variant="secondary" className="text-[10px]">NEW</Badge>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 font-medium">{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {n.status === NotificationStatus.NOTIFICATION_STATUS_UNREAD && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      title="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation()
                        markRead.mutate(n.notificationId)
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {n.status !== NotificationStatus.NOTIFICATION_STATUS_ARCHIVED && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      title="Archive"
                      onClick={(e) => {
                        e.stopPropagation()
                        archive.mutate(n.notificationId)
                      }}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      del.mutate(n.notificationId)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} • Total {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
