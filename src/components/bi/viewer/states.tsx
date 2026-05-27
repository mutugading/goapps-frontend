"use client"

// Viewer empty / error / data-freshness UI states.

import Link from "next/link"
import { AlertCircle, Inbox, RefreshCw, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EmptyStateProps {
  message?: string
  /** When true, show an Upload CTA (caller gates on finance.bi.upload.create). */
  showUploadCta?: boolean
}

export function ViewerEmptyState({ message = "No data for the selected period", showUploadCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {showUploadCta && (
        <Button asChild variant="outline" size="sm">
          <Link href="/finance/bi/upload">
            <Upload className="mr-1 h-4 w-4" />
            Upload Data
          </Link>
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ViewerErrorState({ message = "Failed to load chart", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 py-16 text-center">
      <AlertCircle className="h-10 w-10 text-destructive/60" />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  )
}

/** "Data as of …" freshness badge with a green dot. */
export function DataFreshnessBadge({ timestamp }: { timestamp?: Date | string }) {
  if (!timestamp) return null
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp
  if (isNaN(date.getTime())) return null
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Data as of {date.toLocaleString()}
    </Badge>
  )
}
