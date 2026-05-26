"use client"

// PaperTubeName — resolves a cost_paper_tube_type ID to its code + display name
// via the existing TanStack-cached useCostPaperTubeTypes hook. Avoids the
// "Paper tube: #3" UUID-style display in spec / detail sections.
import { useCostPaperTubeTypes } from "@/hooks/finance/use-cost-paper-tube-type"

interface Props {
  id: number | undefined | null
  className?: string
}

export function PaperTubeName({ id, className }: Props) {
  const { data, isLoading } = useCostPaperTubeTypes()
  if (!id) return <span className={className}>—</span>
  if (isLoading) return <span className={className}>Loading…</span>
  const match = (data ?? []).find((p) => p.paperTubeTypeId === id)
  if (!match) {
    return (
      <span className={className} title={`#${id}`}>
        Unknown paper tube
      </span>
    )
  }
  return (
    <span className={className} title={`#${id}`}>
      {match.code} — {match.displayName}
    </span>
  )
}
