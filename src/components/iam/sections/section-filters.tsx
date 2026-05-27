"use client"

import { useCallback } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DebouncedSearchInput } from "@/components/common"

import { ACTIVE_FILTER_OPTIONS } from "@/types/finance/uom"
import { ActiveFilter, type ListSectionsParams } from "@/types/iam/section"
import { DepartmentCombobox } from "@/components/iam/department-combobox"

interface Props {
    filters: ListSectionsParams
    onFiltersChange: (filters: ListSectionsParams) => void
}

export function SectionFilters({ filters, onFiltersChange }: Props) {
    const handleSearchChange = useCallback(
        (value: string) => onFiltersChange({ ...filters, search: value, page: 1 }),
        [filters, onFiltersChange]
    )

    const handleClear = () => {
        onFiltersChange({
            page: 1,
            pageSize: filters.pageSize,
            search: "",
            departmentId: undefined,
            activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
        })
    }

    const hasActive =
        filters.search ||
        filters.departmentId ||
        (filters.activeFilter !== undefined && filters.activeFilter !== ActiveFilter.ACTIVE_FILTER_UNSPECIFIED)

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DebouncedSearchInput
                value={filters.search || ""}
                onValueChange={handleSearchChange}
                placeholder="Search code, name…"
                debounceMs={300}
                containerClassName="flex-1 sm:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
                <div className="w-[220px]">
                    <DepartmentCombobox
                        value={filters.departmentId || ""}
                        onValueChange={(v) => onFiltersChange({ ...filters, departmentId: v || undefined, page: 1 })}
                        placeholder="All departments"
                    />
                </div>
                <Select
                    value={String(filters.activeFilter ?? ActiveFilter.ACTIVE_FILTER_UNSPECIFIED)}
                    onValueChange={(v) => onFiltersChange({ ...filters, activeFilter: Number(v) as ActiveFilter, page: 1 })}
                >
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        {ACTIVE_FILTER_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasActive && (
                    <Button variant="ghost" size="sm" onClick={handleClear} className="h-10">
                        <X className="mr-1 h-4 w-4" /> Clear
                    </Button>
                )}
            </div>
        </div>
    )
}
