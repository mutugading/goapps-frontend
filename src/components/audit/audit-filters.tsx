"use client"

import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export interface AuditFilterValues {
    page: number
    pageSize: number
    eventType: string
    dateFrom: string
    dateTo: string
}

interface AuditFiltersProps {
    filters: AuditFilterValues
    onFilterChange: (filters: AuditFilterValues) => void
}

const EVENT_TYPE_OPTIONS = [
    { value: "", label: "All Events" },
    { value: "1", label: "Login" },
    { value: "2", label: "Logout" },
    { value: "3", label: "Login Failed" },
    { value: "4", label: "Password Reset" },
    { value: "5", label: "Password Change" },
    { value: "6", label: "2FA Enabled" },
    { value: "7", label: "2FA Disabled" },
    { value: "8", label: "Create" },
    { value: "9", label: "Update" },
    { value: "10", label: "Delete" },
    { value: "11", label: "Export" },
    { value: "12", label: "Import" },
]

export function AuditFilters({ filters, onFilterChange }: AuditFiltersProps) {
    const handleEventTypeChange = (value: string) => {
        onFilterChange({ ...filters, eventType: value === "all" ? "" : value })
    }

    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, dateFrom: e.target.value })
    }

    const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, dateTo: e.target.value })
    }

    const handleClearFilters = () => {
        onFilterChange({
            page: 1,
            pageSize: 10,
            eventType: "",
            dateFrom: "",
            dateTo: "",
        })
    }

    const hasFilters = filters.eventType || filters.dateFrom || filters.dateTo

    return (
        <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
                <Label>Event Type</Label>
                <Select
                    value={filters.eventType || "all"}
                    onValueChange={handleEventTypeChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                        {EVENT_TYPE_OPTIONS.map((option) => (
                            <SelectItem
                                key={option.value || "all"}
                                value={option.value || "all"}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={handleDateFromChange}
                    className="w-[180px]"
                />
            </div>

            <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={handleDateToChange}
                    className="w-[180px]"
                />
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    )
}
