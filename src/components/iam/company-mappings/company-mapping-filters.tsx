"use client"

import { useCallback } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DebouncedSearchInput } from "@/components/common"

import { ACTIVE_FILTER_OPTIONS } from "@/types/finance/uom"
import { ActiveFilter, type ListCompanyMappingsParams } from "@/types/iam/company-mapping"
import { CompanyCombobox } from "@/components/iam/company-combobox"
import { DivisionCombobox } from "@/components/iam/division-combobox"
import { DepartmentCombobox } from "@/components/iam/department-combobox"

interface Props {
    filters: ListCompanyMappingsParams
    onFiltersChange: (filters: ListCompanyMappingsParams) => void
}

export function CompanyMappingFilters({ filters, onFiltersChange }: Props) {
    const handleSearchChange = useCallback(
        (value: string) => onFiltersChange({ ...filters, search: value, page: 1 }),
        [filters, onFiltersChange]
    )

    const handleClear = () => {
        onFiltersChange({
            page: 1,
            pageSize: filters.pageSize,
            search: "",
            companyId: undefined,
            divisionId: undefined,
            departmentId: undefined,
            sectionId: undefined,
            activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
        })
    }

    const hasActive =
        filters.search ||
        filters.companyId ||
        filters.divisionId ||
        filters.departmentId ||
        (filters.activeFilter !== undefined && filters.activeFilter !== ActiveFilter.ACTIVE_FILTER_UNSPECIFIED)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <DebouncedSearchInput
                    value={filters.search || ""}
                    onValueChange={handleSearchChange}
                    placeholder="Search code, name, company, division…"
                    debounceMs={300}
                    containerClassName="flex-1 sm:max-w-md"
                />
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
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <CompanyCombobox
                    value={filters.companyId || ""}
                    onValueChange={(v) => onFiltersChange({ ...filters, companyId: v || undefined, divisionId: undefined, departmentId: undefined, page: 1 })}
                    placeholder="All companies"
                />
                <DivisionCombobox
                    value={filters.divisionId || ""}
                    onValueChange={(v) => onFiltersChange({ ...filters, divisionId: v || undefined, departmentId: undefined, page: 1 })}
                    companyId={filters.companyId || undefined}
                    placeholder="All divisions"
                />
                <DepartmentCombobox
                    value={filters.departmentId || ""}
                    onValueChange={(v) => onFiltersChange({ ...filters, departmentId: v || undefined, page: 1 })}
                    divisionId={filters.divisionId || undefined}
                    companyId={filters.companyId || undefined}
                    placeholder="All departments"
                />
            </div>
            {hasActive && (
                <div>
                    <Button variant="ghost" size="sm" onClick={handleClear} className="h-8">
                        <X className="mr-1 h-4 w-4" /> Clear filters
                    </Button>
                </div>
            )}
        </div>
    )
}
