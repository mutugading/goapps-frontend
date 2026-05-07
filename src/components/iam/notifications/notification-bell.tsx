"use client"

import { Bell, Check, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}h ago`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day}d ago`
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
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1.5 py-0 text-[10px] leading-none">
              {count > 99 ? "99+" : count}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={8}
        // Use Radix's auto-calculated available height (viewport minus trigger
        // position minus padding) so the popover never grows past the screen
        // regardless of viewport size or list length.
        className="flex max-h-[var(--radix-popover-content-available-height)] w-[calc(100vw-2rem)] max-w-96 flex-col p-0 sm:w-96"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Notifications</span>
            {count > 0 && <Badge variant="secondary">{count} new</Badge>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => markAllRead.mutate()}
            disabled={count === 0 || markAllRead.isPending}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Mark all read
          </Button>
        </div>

        {/*
          Plain overflow-y-auto wins over shadcn ScrollArea here because Radix
          ScrollArea renders an extra <div data-radix-scroll-area-viewport>
          with display:table-like inline styles that breaks flex-height
          inheritance inside the popover. A plain overscroll container honors
          flex-1 + min-h-0 reliably and the native scrollbar is fine for a
          dropdown.
        */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No notifications.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.notificationId}
                  role="button"
                  tabIndex={0}
                  className={`cursor-pointer px-4 py-3 hover:bg-accent focus:bg-accent focus:outline-none ${
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
                        className="h-7 w-7 shrink-0 cursor-pointer"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          markRead.mutate(n.notificationId)
                        }}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t px-4 py-2">
          <Button
            variant="link"
            size="sm"
            className="w-full cursor-pointer"
            onClick={() => router.push("/notifications")}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
