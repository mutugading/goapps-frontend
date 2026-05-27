"use client"

// ProductTypeName — resolves a cost_product_type ID to "CODE — Display Name"
// using the cached useCostProductTypes hook. Pulls the entire list once and
// reuses across the table.
import { useCostProductTypes } from "@/hooks/finance/use-cost-product-type"

interface Props {
  id: number | undefined | null
  className?: string
}

export function ProductTypeName({ id, className }: Props) {
  const { data, isLoading } = useCostProductTypes({
    search: "",
    activeFilter: "all",
    sortBy: "type_code",
    sortOrder: "asc",
    page: 1,
    pageSize: 200,
  })
  if (!id) return <span className={className}>—</span>
  if (isLoading) return <span className={className}>Loading…</span>
  const items = data?.items ?? []
  const match = items.find((p) => p.typeId === id)
  if (!match) {
    return (
      <span className={className} title={`#${id}`}>
        Unknown
      </span>
    )
  }
  return (
    <span className={className} title={`#${id}`}>
      {match.typeCode} — {match.typeName}
    </span>
  )
}
