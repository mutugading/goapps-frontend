"use client"

// UserName — resolves an IAM user UUID to "Full Name (@username)" via the
// existing useUser hook. Cached by TanStack Query so multiple displays of
// the same id share a single fetch. Falls back to the id itself only briefly
// while loading; after fetch, always shows a human label per
// feedback_no_uuid_input.md.
import { useUser } from "@/hooks/iam/use-users"

interface Props {
  userId: string | undefined | null
  className?: string
  // Compact mode hides the @username suffix (used inside Badge etc.).
  compact?: boolean
}

export function UserName({ userId, className, compact = false }: Props) {
  const { data: resp, isLoading, error } = useUser(userId || "")
  const detail = resp?.data ?? null
  const username = detail?.user?.username || ""
  const fullName = detail?.detail?.fullName || ""

  if (!userId) return <span className={className}>—</span>
  if (isLoading) {
    return (
      <span className={className} title={userId}>
        Loading…
      </span>
    )
  }
  if (error || !detail) {
    return (
      <span className={className} title={userId}>
        Unknown user
      </span>
    )
  }

  const display = fullName || username || "—"
  return (
    <span className={className} title={userId}>
      {display}
      {!compact && username && display !== username && (
        <span className="text-muted-foreground"> (@{username})</span>
      )}
    </span>
  )
}
