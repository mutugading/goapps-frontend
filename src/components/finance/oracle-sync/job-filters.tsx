"use client"

import { useCallback } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DebouncedSearchInput } from "@/components/common"

import {
  JobStatus,
  JOB_STATUS_FILTER_OPTIONS,
  type ListSyncJobsParams,
} from "@/types/finance/oracle-sync"
import { useSyncPeriods } from "@/hooks/finance/use-oracle-sync"

interface JobFiltersProps {
  filters: ListSyncJobsParams
  onFiltersChange: (filters: ListSyncJobsParams) => void
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const { data: periodsData } = useSyncPeriods()
  const periods = periodsData?.periods || []

  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: Number(value) as JobStatus,
      page: 1,
    })
  }

  const handlePeriodChange = (value: string) => {
    onFiltersChange({
      ...filters,
      period: value === "all" ? undefined : value,
      page: 1,
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
      search: "",
      status: JobStatus.JOB_STATUS_UNSPECIFIED,
      period: undefined,
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.period ||
    (filters.status !== undefined && filters.status !== JobStatus.JOB_STATUS_UNSPECIFIED)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search job code..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select
          value={String(filters.status ?? JobStatus.JOB_STATUS_UNSPECIFIED)}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Period Filter */}
        <Select
          value={filters.period || "all"}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-10"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
