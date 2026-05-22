"use client"

// ErpItemCombobox — picks a CostErpItem by item_code/item_name. Used when rm_type.reference_target = MASTER.
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useErpItems } from "@/hooks/finance/use-cost-erp"
import { cn } from "@/lib/utils"

interface ErpItemComboboxProps {
  value: number | undefined
  onChange: (itemId: number, itemCode: string, itemName: string) => void
  itemType?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ErpItemCombobox({ value, onChange, itemType, placeholder = "Select ERP item…", disabled, className }: ErpItemComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useErpItems({ search, itemType, activeFilter: "active", pageSize: 50 })
  const selected = useMemo(() => data?.items.find((it) => it.itemId === value), [data, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selected ? (
            <span className="truncate">
              <span className="text-muted-foreground">{selected.itemCode}</span> — {selected.itemName}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search by code or name…" value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            <CommandEmpty>No ERP item matches.</CommandEmpty>
            <CommandGroup>
              {(data?.items ?? []).map((it) => (
                <CommandItem
                  key={it.itemId}
                  value={`${it.itemCode} ${it.itemName}`}
                  onSelect={() => {
                    onChange(it.itemId, it.itemCode, it.itemName)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === it.itemId ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <div>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{it.itemCode}</span>
                      <span>{it.itemName}</span>
                    </div>
                    {it.itemType && <span className="text-xs text-muted-foreground">{it.itemType}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
