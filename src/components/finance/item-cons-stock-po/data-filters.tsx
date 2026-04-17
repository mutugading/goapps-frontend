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

import { type ListItemConsStockPOParams, formatPeriod } from "@/types/finance/oracle-sync"
import { useSyncPeriods } from "@/hooks/finance/use-oracle-sync"

interface DataFiltersProps {
  filters: ListItemConsStockPOParams
  onFiltersChange: (filters: ListItemConsStockPOParams) => void
}

export function DataFilters({ filters, onFiltersChange }: DataFiltersProps) {
  const { data: periodsData } = useSyncPeriods()
  const periods = periodsData?.periods || []

  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

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
      period: undefined,
      itemCode: undefined,
    })
  }

  const hasActiveFilters = filters.search || filters.period || filters.itemCode

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search item code, name, grade..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        {/* Period Filter */}
        <Select
          value={filters.period || "all"}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods.map((p) => (
              <SelectItem key={p} value={p}>{formatPeriod(p)}</SelectItem>
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
