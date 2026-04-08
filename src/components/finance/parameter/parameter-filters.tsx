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
  ActiveFilter,
  DataType,
  ParamCategory,
  DATA_TYPE_OPTIONS,
  PARAM_CATEGORY_OPTIONS,
  type ListParametersParams,
} from "@/types/finance/parameter"
import { ACTIVE_FILTER_OPTIONS } from "@/types/finance/uom"

interface ParameterFiltersProps {
  filters: ListParametersParams
  onFiltersChange: (filters: ListParametersParams) => void
}

export function ParameterFilters({ filters, onFiltersChange }: ParameterFiltersProps) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handleDataTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dataType: Number(value) as DataType,
      page: 1,
    })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      paramCategory: Number(value) as ParamCategory,
      page: 1,
    })
  }

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
      dataType: DataType.DATA_TYPE_UNSPECIFIED,
      paramCategory: ParamCategory.PARAM_CATEGORY_UNSPECIFIED,
      activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
      sortBy: "code",
      sortOrder: "asc",
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.dataType !== undefined && filters.dataType !== DataType.DATA_TYPE_UNSPECIFIED) ||
    (filters.paramCategory !== undefined && filters.paramCategory !== ParamCategory.PARAM_CATEGORY_UNSPECIFIED) ||
    (filters.activeFilter !== undefined && filters.activeFilter !== ActiveFilter.ACTIVE_FILTER_UNSPECIFIED)

  const currentSort = `${filters.sortBy || "code"}-${filters.sortOrder || "asc"}`

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search with debounce */}
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search code, name..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Data Type Filter */}
        <Select
          value={String(filters.dataType ?? DataType.DATA_TYPE_UNSPECIFIED)}
          onValueChange={handleDataTypeChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Data Type" />
          </SelectTrigger>
          <SelectContent>
            {DATA_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={String(filters.paramCategory ?? ParamCategory.PARAM_CATEGORY_UNSPECIFIED)}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {PARAM_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            <SelectItem value="category-asc">Category (A-Z)</SelectItem>
            <SelectItem value="category-desc">Category (Z-A)</SelectItem>
            <SelectItem value="data_type-asc">Data Type (A-Z)</SelectItem>
            <SelectItem value="data_type-desc">Data Type (Z-A)</SelectItem>
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
