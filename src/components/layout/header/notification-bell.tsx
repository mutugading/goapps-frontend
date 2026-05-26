"use client"

// NotificationBell — header dropdown showing recent cost-system notifications.
// Polls unread count every 60s (also auto-refreshed by the underlying hook).
import Link from "next/link"
import { Bell, CheckCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
} from "@/hooks/finance/use-cost-notification"
import type { CostNotification, NotificationTrigger } from "@/types/finance/cost-notification"

const TRIGGER_LABEL: Record<NotificationTrigger | string, string> = {
  STATUS_CHANGE: "Status changed",
  MENTION: "You were mentioned",
  ASSIGNED: "Assigned to you",
  FEASIBILITY: "Feasibility decided",
  COMMENT_ADDED: "New comment",
  ROUTING_PROMOTED: "Routing promoted",
  REQUEST_REJECTED: "Request rejected",
  REQUEST_CLOSED: "Request closed",
}

function relativeTime(iso: string): string {
  if (!iso) return ""
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diff = Math.max(0, Date.now() - then)
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function NotificationBell() {
  const { data, isLoading } = useMyNotifications(false, 1, 10)
  const items = data?.items ?? []
  const unreadCount = data?.unreadCount ?? 0
  const markReadM = useMarkNotificationRead()
  const markAllM = useMarkAllNotificationsRead()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllM.mutate()}
              disabled={markAllM.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading && (
          <div className="px-3 py-6 text-sm text-muted-foreground text-center">Loading…</div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="px-3 py-6 text-sm text-muted-foreground text-center">
            No notifications yet.
          </div>
        )}

        {items.map((n) => (
          <NotificationRow
            key={n.notificationId}
            n={n}
            onClick={() => {
              if (!n.isRead) markReadM.mutate(n.notificationId)
            }}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationRow({ n, onClick }: { n: CostNotification; onClick: () => void }) {
  // Tied to a request? Make the row a link to the request detail page.
  const href = n.requestId ? "/finance/product-requests" : null
  const inner = (
    <div
      className={`px-3 py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
        n.isRead ? "opacity-70" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
          <span className="text-sm font-medium truncate">
            {TRIGGER_LABEL[n.triggerType] ?? n.triggerType}
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{relativeTime(n.createdAt)}</span>
      </div>
      {n.requestId && (
        <div className="mt-1 text-xs text-muted-foreground">
          Request <Badge variant="outline" className="font-mono">#{n.requestId}</Badge>
        </div>
      )}
    </div>
  )
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}
