"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { useDivisions } from "@/hooks/iam/use-division"
import { ActiveFilter } from "@/types/iam/division"

interface DivisionComboboxProps {
    value: string
    onValueChange: (value: string) => void
    companyId?: string
    placeholder?: string
    disabled?: boolean
    initialLabel?: string
    allowClear?: boolean
}

export function DivisionCombobox({
    value,
    onValueChange,
    companyId,
    placeholder = "Select division…",
    disabled,
    initialLabel,
    allowClear = true,
}: DivisionComboboxProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const debounced = useDebounce(query, 300)
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

    const list = useDivisions({
        page: 1,
        pageSize: 50,
        search: debounced,
        activeFilter: ActiveFilter.ACTIVE_FILTER_ACTIVE,
        companyId: companyId || undefined,
        sortBy: "division_code",
        sortOrder: "asc",
    })

    const items = list.data?.data ?? []

    const handlePick = (id: string, label: string) => {
        setSelectedLabel(label)
        onValueChange(id)
        setOpen(false)
    }

    const displayLabel = value
        ? selectedLabel || initialLabel || "Selected division"
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
                <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[300px] p-0" align="start">
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search code or name…"
                            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1">
                        {list.isFetching && (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching…
                            </div>
                        )}
                        {!list.isFetching && items.length === 0 && (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {debounced ? "No matching divisions" : "No divisions available"}
                            </p>
                        )}
                        {!list.isFetching &&
                            items.map((item) => {
                                const id = item.divisionId
                                const label = `${item.divisionCode} — ${item.divisionName}`
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
                                        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{label}</p>
                                            {item.company?.companyName && (
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {item.company.companyName}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                    </div>
                </PopoverContent>
            </Popover>
            {allowClear && value && !disabled && (
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
