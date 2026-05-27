"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CalcJobStatus } from "@/types/finance/cost-calc"

interface Props {
  status: CalcJobStatus
  className?: string
}

// Tailwind utility classes per status — matches the muted palette used elsewhere
// in finance pages (e.g. RouteStatus in /finance/routes).
const STATUS_CLASS: Record<CalcJobStatus, string> = {
  QUEUED: "bg-slate-100 text-slate-700",
  PLANNING: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SUCCESS: "bg-emerald-100 text-emerald-700",
  PARTIAL_FAILED: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-zinc-200 text-zinc-700",
}

export function CalcJobStatusBadge({ status, className }: Props) {
  return (
    <Badge className={cn(STATUS_CLASS[status] || "", className)}>
      {status.replace("_", " ")}
    </Badge>
  )
}
