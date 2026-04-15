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

import { ACTIVE_FILTER_OPTIONS } from "@/types/finance/uom"
import {
  ActiveFilter,
  EmployeeLevelType,
  EmployeeLevelWorkflow,
  EMPLOYEE_LEVEL_TYPE_OPTIONS,
  EMPLOYEE_LEVEL_WORKFLOW_OPTIONS,
  type ListEmployeeLevelsParams,
} from "@/types/iam/employee-level"

interface EmployeeLevelFiltersProps {
  filters: ListEmployeeLevelsParams
  onFiltersChange: (filters: ListEmployeeLevelsParams) => void
}

export function EmployeeLevelFilters({
  filters,
  onFiltersChange,
}: EmployeeLevelFiltersProps) {
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

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: Number(value) as EmployeeLevelType,
      page: 1,
    })
  }

  const handleWorkflowChange = (value: string) => {
    onFiltersChange({
      ...filters,
      workflow: Number(value) as EmployeeLevelWorkflow,
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
      type: EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_UNSPECIFIED,
      workflow: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_UNSPECIFIED,
      sortBy: "sequence",
      sortOrder: "asc",
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.activeFilter !== undefined &&
      filters.activeFilter !== ActiveFilter.ACTIVE_FILTER_UNSPECIFIED) ||
    (filters.type !== undefined &&
      filters.type !== EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_UNSPECIFIED) ||
    (filters.workflow !== undefined &&
      filters.workflow !==
        EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_UNSPECIFIED)

  const currentSort = `${filters.sortBy || "sequence"}-${filters.sortOrder || "asc"}`

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
        {/* Type Filter */}
        <Select
          value={String(filters.type ?? EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_UNSPECIFIED)}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={String(EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_UNSPECIFIED)}
            >
              All Types
            </SelectItem>
            {EMPLOYEE_LEVEL_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Workflow Filter */}
        <Select
          value={String(
            filters.workflow ??
              EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_UNSPECIFIED
          )}
          onValueChange={handleWorkflowChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Workflow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value={String(
                EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_UNSPECIFIED
              )}
            >
              All Workflow
            </SelectItem>
            {EMPLOYEE_LEVEL_WORKFLOW_OPTIONS.map((option) => (
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
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sequence-asc">Sequence (Low→High)</SelectItem>
            <SelectItem value="sequence-desc">Sequence (High→Low)</SelectItem>
            <SelectItem value="grade-asc">Grade (Low→High)</SelectItem>
            <SelectItem value="grade-desc">Grade (High→Low)</SelectItem>
            <SelectItem value="code-asc">Code (A-Z)</SelectItem>
            <SelectItem value="code-desc">Code (Z-A)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
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
