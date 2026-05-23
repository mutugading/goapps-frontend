"use client"

import { PageHeader } from "@/components/common/page-header"
import { useUrlState } from "@/lib/hooks"
import type { CalculationType } from "@/types/finance/cost-calc"

import { CostResultDetail } from "./cost-result-detail"
import { CostResultFilters } from "./cost-result-filters"

// TODO(S8e): backend has no bulk-list RPC for cost results — only
// GetCostResult(productSysId, period, calcType) + ListCostHistory(productSysId).
// This page is therefore a "single result viewer" with required filters.
// A broader cross-product list view would need a new ListCostResults RPC.

interface CostResultsFiltersState {
  productSysId: number
  period: string
  calcType: string
}

const defaultFilters: CostResultsFiltersState = {
  productSysId: 0,
  period: "",
  calcType: "",
}

export function CostResultsPageClient() {
  const [filters, setFilters] = useUrlState<CostResultsFiltersState>({
    defaultValues: defaultFilters,
  })

  const ready =
    filters.productSysId > 0 && filters.period.length === 6 && filters.calcType !== ""

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost results"
        subtitle="Per-product unit costs by period and calculation type"
      />

      <CostResultFilters
        value={{
          productSysId: filters.productSysId || undefined,
          period: filters.period || undefined,
          calcType: filters.calcType || undefined,
        }}
        onChange={(next) =>
          setFilters({
            productSysId: next.productSysId ?? 0,
            period: next.period ?? "",
            calcType: next.calcType ?? "",
          })
        }
      />

      {ready ? (
        <CostResultDetail
          productSysId={filters.productSysId}
          period={filters.period}
          calcType={filters.calcType as CalculationType}
        />
      ) : (
        <div className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Pick a product, period, and calculation type to view the cost result.
        </div>
      )}
    </div>
  )
}
