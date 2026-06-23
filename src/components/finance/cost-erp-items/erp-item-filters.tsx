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
  type ListErpItemsParams,
  ERP_ACTIVE_FILTER_OPTIONS,
  ERP_ITEM_TYPE_OPTIONS,
} from "@/types/finance/cost-erp"

interface ErpItemFiltersProps {
  filters: ListErpItemsParams
  onFiltersChange: (filters: ListErpItemsParams) => void
}

export function ErpItemFilters({ filters, onFiltersChange }: ErpItemFiltersProps) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange],
  )

  const handleItemTypeChange = (value: string) => {
    onFiltersChange({ ...filters, itemType: value === "all" ? "" : value, page: 1 })
  }

  const handleActiveFilterChange = (value: string) => {
    onFiltersChange({ ...filters, activeFilter: value as ListErpItemsParams["activeFilter"], page: 1 })
  }

  const handleClearFilters = () => {
    onFiltersChange({ page: 1, pageSize: filters.pageSize, search: "", itemType: "", activeFilter: "all" })
  }

  const hasActiveFilters = filters.search || filters.itemType || (filters.activeFilter && filters.activeFilter !== "all")

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search by code or name..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.itemType || "all"}
          onValueChange={handleItemTypeChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Item Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ERP_ITEM_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.activeFilter || "all"}
          onValueChange={handleActiveFilterChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ERP_ACTIVE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-10">
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
