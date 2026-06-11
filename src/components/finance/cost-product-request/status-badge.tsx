"use client"

// StatusBadge — renders the lifecycle status with colour coding.
import { Badge } from "@/components/ui/badge"
import type { ClosedSubstatus, RequestStatus } from "@/types/finance/cost-product-request"

const STATUS_VARIANT: Record<string, "secondary" | "outline" | "destructive" | "default"> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  UNDER_REVIEW: "secondary",
  ROUTING_DEFINED: "secondary",
  PARAMETER_PENDING: "secondary",
  PARAMETER_COMPLETE: "secondary",
  CONFIRMED: "default",
  APPROVED: "default",
  RELEASED: "default",
  COSTING_DONE: "default",
  QUOTED: "default",
  QUOTE_READY: "default",
  CLOSED: "outline",
  REJECTED: "destructive",
}

export function StatusBadge({
  status,
  substatus,
  size = "default",
}: {
  status: RequestStatus
  substatus?: ClosedSubstatus
  size?: "default" | "lg"
}) {
  const variant = STATUS_VARIANT[status] ?? "secondary"
  const sizeClass = size === "lg" ? "text-sm px-3 py-1" : ""
  const label =
    status === "CLOSED" && substatus
      ? `${status} · ${substatus}`
      : status.replace(/_/g, " ")
  return (
    <Badge variant={variant} className={sizeClass} data-testid="request-status-badge">
      {label}
    </Badge>
  )
}
