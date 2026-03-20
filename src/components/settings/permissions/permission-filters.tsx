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
    ACTIVE_FILTER_OPTIONS,
    ACTION_TYPE_OPTIONS,
    type ListPermissionsParams,
} from "@/types/iam/role"

interface PermissionFiltersProps {
    filters: ListPermissionsParams
    onFiltersChange: (filters: ListPermissionsParams) => void
}

export function PermissionFilters({ filters, onFiltersChange }: PermissionFiltersProps) {
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

    const handleActionTypeChange = (value: string) => {
        onFiltersChange({
            ...filters,
            actionType: value === "all" ? "" : value,
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
            actionType: "",
            sortBy: "code",
            sortOrder: "asc",
        })
    }

    const hasActiveFilters =
        filters.search ||
        (filters.activeFilter !== undefined && filters.activeFilter !== ActiveFilter.ACTIVE_FILTER_UNSPECIFIED) ||
        filters.actionType

    const currentSort = `${filters.sortBy || "code"}-${filters.sortOrder || "asc"}`

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DebouncedSearchInput
                value={filters.search || ""}
                onValueChange={handleSearchChange}
                placeholder="Search permission code, name..."
                debounceMs={300}
                containerClassName="flex-1 sm:max-w-sm"
            />

            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={filters.actionType || "all"}
                    onValueChange={handleActionTypeChange}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {ACTION_TYPE_OPTIONS.filter((o) => o.value).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

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

                <Select value={currentSort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="code-asc">Code (A-Z)</SelectItem>
                        <SelectItem value="code-desc">Code (Z-A)</SelectItem>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="service_name-asc">Service (A-Z)</SelectItem>
                        <SelectItem value="created_at-desc">Newest First</SelectItem>
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
