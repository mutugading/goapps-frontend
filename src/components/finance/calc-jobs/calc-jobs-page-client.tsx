"use client"

import { useState } from "react"
import { Layers, Loader2, Plus, XCircle, Clock } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { KpiCard, KpiGrid } from "@/components/common"
import { Button } from "@/components/ui/button"
import { usePermissionContext } from "@/providers/permission-provider"
import { useUrlState } from "@/lib/hooks"
import { useCalcJobCounts, useCalcJobs } from "@/hooks/finance/use-cost-calc"
import type {
  CalcJobStatus,
  CalculationType,
  ListCalcJobsParams,
} from "@/types/finance/cost-calc"

import { CalcJobsFilters } from "./calc-jobs-filters"
import { CalcJobsTable } from "./calc-jobs-table"
import { NewJobDialog } from "./new-job-dialog"

const defaultFilters: ListCalcJobsParams = {
  period: "",
  calculationType: "",
  status: "",
  triggeredBy: "",
  page: 1,
  pageSize: 20,
}

export function CalcJobsPageClient() {
  const { hasPermission } = usePermissionContext()
  const canTrigger = hasPermission("finance.cost.caljob.trigger")
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useUrlState<ListCalcJobsParams>({
    defaultValues: defaultFilters,
  })

  const { data, isLoading } = useCalcJobs({
    period: filters.period || undefined,
    calculationType: (filters.calculationType || undefined) as CalculationType | undefined,
    status: (filters.status || undefined) as CalcJobStatus | undefined,
    triggeredBy: filters.triggeredBy || undefined,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
  })
  const { data: counts, isLoading: countsLoading } = useCalcJobCounts()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calc Jobs"
        subtitle="Cost calculation batch jobs — trigger, monitor, and cancel."
      >
        {canTrigger && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New job
          </Button>
        )}
      </PageHeader>

      <KpiGrid>
        <KpiCard title="Total jobs" value={counts?.total ?? 0} icon={Layers} loading={countsLoading} />
        <KpiCard title="Queued" value={counts?.queued ?? 0} icon={Clock} variant="warning" loading={countsLoading} />
        <KpiCard title="Processing" value={counts?.processing ?? 0} icon={Loader2} variant="warning" loading={countsLoading} />
        <KpiCard title="Failed" value={counts?.failed ?? 0} icon={XCircle} variant="destructive" loading={countsLoading} />
      </KpiGrid>

      <CalcJobsFilters
        value={{
          period: filters.period,
          calculationType: filters.calculationType,
          status: filters.status,
          triggeredBy: filters.triggeredBy,
        }}
        onChange={(next) =>
          setFilters({
            ...filters,
            period: next.period ?? "",
            calculationType: next.calculationType ?? "",
            status: next.status ?? "",
            triggeredBy: next.triggeredBy ?? "",
            page: 1,
          })
        }
      />

      <CalcJobsTable
        items={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? filters.page ?? 1}
        pageSize={data?.pageSize ?? filters.pageSize ?? 20}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(page) => setFilters({ ...filters, page })}
        onPageSizeChange={(pageSize) =>
          setFilters({ ...filters, pageSize, page: 1 })
        }
      />

      <NewJobDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
