"use client"

import { Suspense, useMemo } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { RunsFilters, RunsTable, parseYymm, type RunsFilterValues } from "@/components/payroll"
import { usePayrollRuns } from "@/hooks/payroll"
import { useUrlState } from "@/lib/hooks"

const defaultFilters: RunsFilterValues = { yymm: "", division: "", status: "" }

function RunsPageContent() {
  const [filters, setFilters] = useUrlState<RunsFilterValues>({ defaultValues: defaultFilters })

  const yymm = parseYymm(filters.yymm)
  const { data, isLoading, isError, error } = usePayrollRuns({
    yymm,
    division: filters.division || undefined,
  })

  // Status is filtered client-side: the list endpoint only takes yymm/division.
  const rows = useMemo(
    () => (filters.status ? (data ?? []).filter((r) => r.status === filters.status) : (data ?? [])),
    [data, filters.status]
  )

  const yymmInvalid = filters.yymm !== "" && yymm === undefined

  return (
    <div>
      <PageHeader title="Payroll Runs" subtitle="Run history per period and division (read-only; runs are started from the CLI)" />
      <Card>
        <CardHeader>
          <CardTitle>Runs</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${rows.length} run(s)`}
            {yymmInvalid && " - period filter ignored: use yyyymm, e.g. 202701"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RunsFilters filters={filters} onFiltersChange={setFilters} />
          {isError ? (
            <p role="alert" className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load payroll runs"}
            </p>
          ) : (
            <RunsTable data={rows} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function RunsPageClient() {
  return (
    <Suspense>
      <RunsPageContent />
    </Suspense>
  )
}
