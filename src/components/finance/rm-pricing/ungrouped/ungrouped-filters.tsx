"use client"

import { useCallback } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DebouncedSearchInput } from "@/components/common"

import { type GroupingScope, type ListUngroupedItemsParams } from "@/types/finance/rm-group"

interface UngroupedFiltersProps {
  filters: ListUngroupedItemsParams
  onFiltersChange: (filters: ListUngroupedItemsParams) => void
  scope: GroupingScope
}

interface SortOption {
  value: string // "<sortBy>-<sortOrder>"
  label: string
  scope?: "grouped" // only render when scope matches
}

const sortOptions: SortOption[] = [
  { value: "item_code-asc", label: "Item Code (A-Z)" },
  { value: "item_code-desc", label: "Item Code (Z-A)" },
  { value: "item_name-asc", label: "Item Name (A-Z)" },
  { value: "item_name-desc", label: "Item Name (Z-A)" },
  { value: "grade_code-asc", label: "Grade Code (A-Z)" },
  { value: "grade_code-desc", label: "Grade Code (Z-A)" },
  { value: "item_grade-asc", label: "Grade Name (A-Z)" },
  { value: "item_grade-desc", label: "Grade Name (Z-A)" },
  { value: "uom_code-asc", label: "UOM (A-Z)" },
  { value: "uom_code-desc", label: "UOM (Z-A)" },
  { value: "group_code-asc", label: "Group Code (A-Z)", scope: "grouped" },
  { value: "group_code-desc", label: "Group Code (Z-A)", scope: "grouped" },
  { value: "group_name-asc", label: "Group Name (A-Z)", scope: "grouped" },
  { value: "group_name-desc", label: "Group Name (Z-A)", scope: "grouped" },
  { value: "sort_order-asc", label: "Sort Order (Low→High)", scope: "grouped" },
  { value: "sort_order-desc", label: "Sort Order (High→Low)", scope: "grouped" },
  { value: "assigned_at-desc", label: "Newest First", scope: "grouped" },
  { value: "assigned_at-asc", label: "Oldest First", scope: "grouped" },
]

// Search + sort. Period filter intentionally absent — the grouping monitor
// is cross-period.
export function UngroupedFilters({ filters, onFiltersChange, scope }: UngroupedFiltersProps) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handleClearSearch = () => {
    onFiltersChange({ ...filters, search: "", page: 1 })
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-")
    onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 })
  }

  const currentSort = `${filters.sortBy || "item_code"}-${filters.sortOrder || "asc"}`

  // In ungrouped scope, group_* options would be ignored by the backend —
  // hide them so the dropdown only shows actionable choices.
  const itemSortOptions = sortOptions.filter((opt) => !opt.scope)
  const groupSortOptions = sortOptions.filter((opt) => opt.scope === "grouped")

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search item code, name, grade, or group..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-md"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Item</SelectLabel>
              {itemSortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
            {scope === "grouped" && (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Group</SelectLabel>
                  {groupSortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
          </SelectContent>
        </Select>

        {filters.search && (
          <Button variant="ghost" size="sm" onClick={handleClearSearch} className="h-10">
            <X className="mr-1 h-4 w-4" />
            Clear search
          </Button>
        )}
      </div>
    </div>
  )
}
