"use client"

import { Suspense, useMemo, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import {
  PeriodActionDialog,
  PeriodsTable,
  RunsFilters,
  parseYymm,
  type PeriodDialogAction,
  type RunsFilterValues,
} from "@/components/payroll"
import { usePayrollPeriods } from "@/hooks/payroll"
import { useUrlState } from "@/lib/hooks"
import type { Period } from "@/types/generated/payroll/v1/run"

const defaultFilters: RunsFilterValues = { yymm: "", division: "", status: "" }

function PeriodsPageContent() {
  const [filters, setFilters] = useUrlState<RunsFilterValues>({ defaultValues: defaultFilters })
  const [action, setAction] = useState<PeriodDialogAction | null>(null)
  const [selected, setSelected] = useState<Period | null>(null)

  const { data, isLoading, isError, error } = usePayrollPeriods(filters.division || undefined)

  // yymm is filtered client-side: the list endpoint only takes division.
  const yymm = parseYymm(filters.yymm)
  const rows = useMemo(() => (yymm ? (data ?? []).filter((p) => p.yymm === yymm) : (data ?? [])), [data, yymm])

  return (
    <div>
      <PageHeader title="Payroll Periods" subtitle="Period status per division; approve, close, or reopen" />
      <Card>
        <CardHeader>
          <CardTitle>Periods</CardTitle>
          <CardDescription>{isLoading ? "Loading..." : `${rows.length} period(s)`}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RunsFilters filters={filters} onFiltersChange={setFilters} showStatus={false} />
          {isError ? (
            <p role="alert" className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load payroll periods"}
            </p>
          ) : (
            <PeriodsTable
              data={rows}
              isLoading={isLoading}
              onAction={(a, p) => {
                setSelected(p)
                setAction(a)
              }}
            />
          )}
        </CardContent>
      </Card>
      <PeriodActionDialog
        action={action}
        period={selected}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
      />
    </div>
  )
}

export default function PeriodsPageClient() {
  return (
    <Suspense>
      <PeriodsPageContent />
    </Suspense>
  )
}
