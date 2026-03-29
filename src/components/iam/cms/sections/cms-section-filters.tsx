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
  CMSSectionType,
  SECTION_TYPE_OPTIONS,
  PUBLISH_STATUS_OPTIONS,
  type ListCMSSectionsParams,
} from "@/types/iam/cms-section"

interface CMSSectionFiltersProps {
  filters: ListCMSSectionsParams
  onFiltersChange: (filters: ListCMSSectionsParams) => void
}

export function CMSSectionFilters({ filters, onFiltersChange }: CMSSectionFiltersProps) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sectionType: Number(value) as CMSSectionType,
      page: 1,
    })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isPublished: value === "all" ? null : value === "true",
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
      sectionType: CMSSectionType.CMS_SECTION_TYPE_UNSPECIFIED,
      isPublished: null,
      sortBy: "sort_order",
      sortOrder: "asc",
    })
  }

  const currentStatus = filters.isPublished === null || filters.isPublished === undefined
    ? "all"
    : String(filters.isPublished)

  const hasActiveFilters =
    filters.search ||
    (filters.sectionType !== undefined && filters.sectionType !== CMSSectionType.CMS_SECTION_TYPE_UNSPECIFIED) ||
    filters.isPublished !== null

  const currentSort = `${filters.sortBy || "sort_order"}-${filters.sortOrder || "asc"}`

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search key, title..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(filters.sectionType ?? CMSSectionType.CMS_SECTION_TYPE_UNSPECIFIED)}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {PUBLISH_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sort_order-asc">Sort Order</SelectItem>
            <SelectItem value="key-asc">Key (A-Z)</SelectItem>
            <SelectItem value="key-desc">Key (Z-A)</SelectItem>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
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
