"use client"

import { useCallback, useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"

import { type ListRMCostsParams } from "@/types/finance/rm-cost"

interface CostFiltersProps {
  filters: ListRMCostsParams
  onFiltersChange: (filters: ListRMCostsParams) => void
  availablePeriods?: string[]
  defaultPeriod?: string
}

export function CostFilters({
  filters,
  onFiltersChange,
  availablePeriods = [],
  defaultPeriod = "",
}: CostFiltersProps) {
  // Local-state mirror for period input so fast typing isn't swallowed by
  // URL-state debouncing. Propagate on blur, Enter, or after 6 digits.
  const [periodInput, setPeriodInput] = useState(filters.period || "")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeriodInput(filters.period || "")
  }, [filters.period])

  const commitPeriod = () => {
    if (periodInput !== filters.period) {
      onFiltersChange({ ...filters, period: periodInput, page: 1 })
    }
  }

  const handlePeriodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
    setPeriodInput(v)
    if (v.length === 6) {
      onFiltersChange({ ...filters, period: v, page: 1 })
    } else if (v.length === 0 && filters.period) {
      onFiltersChange({ ...filters, period: "", page: 1 })
    }
  }

  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handlePeriodChange = (value: string) => {
    onFiltersChange({
      ...filters,
      period: value === "all" ? "" : value,
      page: 1,
    })
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-")
    onFiltersChange({ ...filters, sortBy, sortOrder })
  }

  // Treat the latest available period as the implicit default even when the
  // prop hasn't arrived yet (e.g. when availablePeriods list races the filter).
  const effectiveDefaultPeriod = defaultPeriod || availablePeriods[0] || ""
  const isPeriodActive =
    Boolean(filters.period) && filters.period !== effectiveDefaultPeriod
  const hasActiveFilters = Boolean(filters.search) || isPeriodActive

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
      search: "",
      period: effectiveDefaultPeriod,
      sortBy: "rm_code",
      sortOrder: "asc",
    })
  }

  const currentSort = `${filters.sortBy || "rm_code"}-${filters.sortOrder || "asc"}`

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search RM code, name..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        {/* Period Filter */}
        {availablePeriods.length > 0 ? (
          <Select
            value={filters.period || "all"}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              {availablePeriods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="YYYYMM"
            value={periodInput}
            onChange={handlePeriodInputChange}
            onBlur={commitPeriod}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitPeriod()
            }}
            className="w-[130px] font-mono"
            maxLength={6}
            inputMode="numeric"
          />
        )}

        {/* Sort */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rm_code-asc">Code (A-Z)</SelectItem>
            <SelectItem value="rm_code-desc">Code (Z-A)</SelectItem>
            <SelectItem value="period-desc">Period (Newest)</SelectItem>
            <SelectItem value="period-asc">Period (Oldest)</SelectItem>
            <SelectItem value="calculated_at-desc">Recently Calculated</SelectItem>
          </SelectContent>
        </Select>

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
