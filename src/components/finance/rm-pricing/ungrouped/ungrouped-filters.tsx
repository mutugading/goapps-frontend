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
import { Input } from "@/components/ui/input"
import { DebouncedSearchInput } from "@/components/common"

import { type ListUngroupedItemsParams } from "@/types/finance/rm-group"

interface UngroupedFiltersProps {
  filters: ListUngroupedItemsParams
  onFiltersChange: (filters: ListUngroupedItemsParams) => void
  availablePeriods?: string[]
}

export function UngroupedFilters({
  filters,
  onFiltersChange,
  availablePeriods = [],
}: UngroupedFiltersProps) {
  // Local-state mirror for the period input so fast typing is not truncated
  // by URL-state debouncing inside useUrlState. Propagate on blur or after
  // 6 digits are entered.
  const [periodInput, setPeriodInput] = useState(filters.period || "")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeriodInput(filters.period || "")
  }, [filters.period])

  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handlePeriodChange = (value: string) => {
    onFiltersChange({ ...filters, period: value, page: 1 })
  }

  const commitPeriod = () => {
    if (periodInput !== filters.period) {
      onFiltersChange({ ...filters, period: periodInput, page: 1 })
    }
  }

  const handlePeriodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
    setPeriodInput(v)
    // Auto-commit once a full 6-digit YYYYMM is typed.
    if (v.length === 6) {
      onFiltersChange({ ...filters, period: v, page: 1 })
    } else if (v.length === 0 && filters.period) {
      onFiltersChange({ ...filters, period: "", page: 1 })
    }
  }

  const handleClearSearch = () => {
    onFiltersChange({ ...filters, search: "", page: 1 })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search item code or name..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        {availablePeriods.length > 0 ? (
          <Select value={filters.period || ""} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.length === 6 ? `${p.substring(0, 4)}-${p.substring(4)}` : p}
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

        {filters.search && (
          <Button variant="ghost" size="sm" onClick={handleClearSearch} className="h-10">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
