"use client"

// Company Mapping Combobox - searchable async dropdown displaying full org path.

import { useState } from "react"
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { useCompanyMappings } from "@/hooks/iam/use-company-mapping"
import { ActiveFilter, formatCompanyMappingPath } from "@/types/iam/company-mapping"

interface CompanyMappingComboboxProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    initialLabel?: string
}

export function CompanyMappingCombobox({
    value,
    onValueChange,
    placeholder = "Select company mapping…",
    disabled,
    initialLabel,
}: CompanyMappingComboboxProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const debounced = useDebounce(query, 300)
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

    const list = useCompanyMappings({
        page: 1,
        pageSize: 50,
        search: debounced,
        activeFilter: ActiveFilter.ACTIVE_FILTER_ACTIVE,
        sortBy: "code",
        sortOrder: "asc",
    })

    const items = list.data?.data ?? []

    const handlePick = (id: string, label: string) => {
        setSelectedLabel(label)
        onValueChange(id)
        setOpen(false)
    }

    const displayLabel = value
        ? selectedLabel || initialLabel || "Selected mapping"
        : placeholder

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <span className="truncate">{displayLabel}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] min-w-[360px] p-0"
                    align="start"
                >
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search code, name, company, division, dept…"
                            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto p-1">
                        {list.isFetching && (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching…
                            </div>
                        )}
                        {!list.isFetching && items.length === 0 && (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {debounced ? "No matching mappings" : "No mappings available"}
                            </p>
                        )}
                        {!list.isFetching &&
                            items.map((item) => {
                                const id = item.companyMappingId
                                const label = formatCompanyMappingPath(item)
                                const isSelected = id === value
                                return (
                                    <button
                                        type="button"
                                        key={id}
                                        onClick={() => handlePick(id, label)}
                                        className={cn(
                                            "flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                                            isSelected && "bg-accent"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mt-0.5 h-4 w-4 shrink-0",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {item.code} — {item.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {[
                                                    item.companyName,
                                                    item.divisionName,
                                                    item.departmentName,
                                                    item.sectionName,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" › ")}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                    </div>
                </PopoverContent>
            </Popover>
            {value && !disabled && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setSelectedLabel(null)
                        onValueChange("")
                    }}
                    aria-label="Clear selection"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
