"use client"

import { Bell, Check, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useNotifications,
  useUnreadCount,
  useMarkAllAsRead,
  useMarkAsRead,
} from "@/hooks/iam/use-notifications"
import {
  Notification,
  NotificationStatus,
  severityClass,
  typeLabel,
} from "@/types/iam/notification"
import { executeNotificationAction } from "./notification-actions"

function formatRelative(iso: string): string {
  if (!iso) return ""
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ""
  const diff = Date.now() - t
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "baru saja"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m lalu`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}j lalu`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day}h lalu`
  return new Date(iso).toLocaleDateString()
}

export function NotificationBell() {
  const router = useRouter()
  const unread = useUnreadCount()
  const list = useNotifications({ page: 1, pageSize: 10, sortOrder: "desc" })
  const markRead = useMarkAsRead()
  const markAllRead = useMarkAllAsRead()

  const items = list.data?.items ?? []
  const count = unread.data ?? 0

  const handleClick = (n: Notification) => {
    const ran = executeNotificationAction(n, router)
    if (n.status === NotificationStatus.NOTIFICATION_STATUS_UNREAD) {
      markRead.mutate(n.notificationId)
    }
    // If the action navigated/downloaded, the popover will unmount naturally.
    // Otherwise leave it open.
    void ran
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1.5 py-0 text-[10px] leading-none">
              {count > 99 ? "99+" : count}
            </Badge>
          )}
          <span className="sr-only">Notifikasi</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] max-w-96 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Notifikasi</span>
            {count > 0 && <Badge variant="secondary">{count} baru</Badge>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={count === 0 || markAllRead.isPending}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Tandai semua
          </Button>
        </div>

        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.notificationId}
                  role="button"
                  tabIndex={0}
                  className={`cursor-pointer px-4 py-3 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring ${
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${severityClass(n.severity)}`}>
                          {typeLabel(n.type)}
                        </span>
                        {n.status === NotificationStatus.NOTIFICATION_STATUS_UNREAD && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium">{n.title}</p>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</p>
                    </div>
                    {n.status === NotificationStatus.NOTIFICATION_STATUS_UNREAD && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          markRead.mutate(n.notificationId)
                        }}
                        title="Tandai sudah dibaca"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2">
          <Button
            variant="link"
            size="sm"
            className="w-full"
            onClick={() => router.push("/notifications")}
          >
            Lihat semua notifikasi
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
