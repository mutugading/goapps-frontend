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

import { ActiveFilter, ACTIVE_FILTER_OPTIONS } from "@/types/finance/uom"
import { type ListUOMCategoriesParams } from "@/types/finance/uom-category"

interface UOMCategoryFiltersProps {
  filters: ListUOMCategoriesParams
  onFiltersChange: (filters: ListUOMCategoriesParams) => void
}

export function UOMCategoryFilters({ filters, onFiltersChange }: UOMCategoryFiltersProps) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handleActiveFilterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      activeFilter: Number(value) as ActiveFilter,
      page: 1,
    })
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-")
    onFiltersChange({ ...filters, sortBy, sortOrder })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
      search: "",
      activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
      sortBy: "code",
      sortOrder: "asc",
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.activeFilter !== undefined && filters.activeFilter !== ActiveFilter.ACTIVE_FILTER_UNSPECIFIED)

  const currentSort = `${filters.sortBy || "code"}-${filters.sortOrder || "asc"}`

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search with debounce */}
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search code, name, description..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select
          value={String(filters.activeFilter ?? ActiveFilter.ACTIVE_FILTER_UNSPECIFIED)}
          onValueChange={handleActiveFilterChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="code-asc">Code (A-Z)</SelectItem>
            <SelectItem value="code-desc">Code (Z-A)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
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
