"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useMenus } from "@/hooks/iam/use-menu"

interface MenuComboboxProps {
    value: string
    onChange: (menuId: string) => void
    disabled?: boolean
}

// GLOBAL_OPTION represents a permission that is not scoped to any single page.
const GLOBAL_VALUE = "__global__"

/**
 * MenuCombobox is a searchable selector for the owning page/menu of a permission.
 * It never exposes raw UUIDs to the user — it shows the menu title (and URL when present).
 * Selecting "Global / none" clears the association (empty menuId).
 */
export function MenuCombobox({ value, onChange, disabled }: MenuComboboxProps) {
    const [open, setOpen] = useState(false)
    // page_size is capped at 100 by proto validation; 100 covers the current menu set.
    // sort_by must be one of the proto-allowed values (snake_case): "", code, title, sort_order, created_at.
    const { data, isLoading } = useMenus({ page: 1, pageSize: 100, sortBy: "sort_order", sortOrder: "asc" })
    const menus = data?.data ?? []

    const selected = menus.find((m) => m.menuId === value)
    const label = value === "" ? "Global / none" : selected ? selected.menuTitle : "Select page…"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between font-normal"
                >
                    <span className="truncate">{label}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command
                    filter={(itemValue, search) => (itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
                >
                    <CommandInput placeholder="Search page…" />
                    <CommandList>
                        <CommandEmpty>{isLoading ? "Loading…" : "No page found."}</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="Global / none"
                                onSelect={() => {
                                    onChange("")
                                    setOpen(false)
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === "" ? "opacity-100" : "opacity-0")} />
                                <span className="text-muted-foreground">Global / none (no owning page)</span>
                            </CommandItem>
                            {menus.map((menu) => (
                                <CommandItem
                                    key={menu.menuId}
                                    value={`${menu.menuTitle} ${menu.menuUrl ?? ""} ${menu.menuCode}`}
                                    onSelect={() => {
                                        onChange(menu.menuId)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === menu.menuId ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="flex min-w-0 flex-col">
                                        <span className="truncate">{menu.menuTitle}</span>
                                        {menu.menuUrl ? (
                                            <span className="truncate font-mono text-xs text-muted-foreground">
                                                {menu.menuUrl}
                                            </span>
                                        ) : null}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export { GLOBAL_VALUE }
