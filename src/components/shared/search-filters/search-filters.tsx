"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * Filter definition
 */
export interface FilterDef<T = string | number> {
  /** Unique identifier */
  id: string
  /** Filter label */
  label: string
  /** Filter options */
  options: { value: T; label: string }[]
  /** Default value */
  defaultValue?: T
  /** Placeholder text */
  placeholder?: string
}

/**
 * Filter values
 */
export type FilterValues = Record<string, string | number | undefined>

export interface SearchFiltersProps {
  /** Search placeholder */
  searchPlaceholder?: string
  /** Initial search value */
  initialSearch?: string
  /** Search change handler */
  onSearch: (value: string) => void
  /** Filter definitions */
  filters?: FilterDef[]
  /** Initial filter values */
  initialFilters?: FilterValues
  /** Filter change handler */
  onFilterChange?: (filters: FilterValues) => void
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number
  /** Additional class name */
  className?: string
}

/**
 * Reusable search and filters component
 */
export function SearchFilters({
  searchPlaceholder = "Search...",
  initialSearch = "",
  onSearch,
  filters = [],
  initialFilters = {},
  onFilterChange,
  debounceMs = 300,
  className,
}: SearchFiltersProps) {
  const [searchValue, setSearchValue] = useState(initialSearch)
  const [filterValues, setFilterValues] = useState<FilterValues>(initialFilters)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue, debounceMs, onSearch])

  // Handle filter change
  const handleFilterChange = useCallback(
    (filterId: string, value: string | number) => {
      const newFilters = { ...filterValues, [filterId]: value }
      setFilterValues(newFilters)
      onFilterChange?.(newFilters)
    },
    [filterValues, onFilterChange]
  )

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchValue("")
    onSearch("")
  }, [onSearch])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters: FilterValues = {}
    filters.forEach((f) => {
      clearedFilters[f.id] = f.defaultValue
    })
    setFilterValues(clearedFilters)
    onFilterChange?.(clearedFilters)
  }, [filters, onFilterChange])

  const hasActiveFilters = Object.values(filterValues).some(
    (v) => v !== undefined && v !== ""
  )

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center", className)}>
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {filters.map((filter) => (
        <Select
          key={filter.id}
          value={String(filterValues[filter.id] ?? filter.defaultValue ?? "")}
          onValueChange={(value) => handleFilterChange(filter.id, value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={filter.placeholder || filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
