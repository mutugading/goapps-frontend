"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  baseBadgeVariant,
  getStatusDisplay,
  semanticBadgeClasses,
} from "@/lib/ui/status-colors"
import type { ClosedSubstatus, RequestStatus } from "@/types/finance/cost-product-request"

export function StatusBadge({
  status,
  substatus,
  size = "default",
}: {
  status: RequestStatus
  substatus?: ClosedSubstatus
  size?: "default" | "lg"
}) {
  const { variant, label: baseLabel } = getStatusDisplay("request", status)
  const label =
    status === "CLOSED" && substatus
      ? `${baseLabel} · ${substatus.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}`
      : baseLabel

  return (
    <Badge
      variant={baseBadgeVariant(variant)}
      className={cn(
        semanticBadgeClasses[variant],
        size === "lg" && "text-sm px-3 py-1",
      )}
      data-testid="request-status-badge"
    >
      {label}
    </Badge>
  )
}
