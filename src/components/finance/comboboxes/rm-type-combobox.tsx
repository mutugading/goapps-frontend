"use client"

// RmTypeCombobox — picks a CostRmType. Exposes reference_target so caller knows whether to
// follow up with ProductMasterCombobox (PRODUCT) or ErpItemCombobox (MASTER).
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCostRmTypes } from "@/hooks/finance/use-cost-rm-type"
import type { ReferenceTarget } from "@/types/finance/cost-rm-type"
import { cn } from "@/lib/utils"

interface RmTypeComboboxProps {
  value: number | undefined
  onChange: (typeId: number, typeCode: string, referenceTarget: ReferenceTarget) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RmTypeCombobox({ value, onChange, placeholder = "Select RM type…", disabled, className }: RmTypeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useCostRmTypes({ search, activeFilter: "active", pageSize: 50 })
  const selected = useMemo(() => data?.items.find((t) => t.typeId === value), [data, value])

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
              <span className="text-muted-foreground">{selected.typeCode}</span> — {selected.typeName}
              <span className="ml-2 text-xs text-muted-foreground">[{selected.referenceTarget}]</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search RM types…" value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            <CommandEmpty>No RM type matches.</CommandEmpty>
            <CommandGroup>
              {(data?.items ?? []).map((t) => (
                <CommandItem
                  key={t.typeId}
                  value={`${t.typeCode} ${t.typeName}`}
                  onSelect={() => {
                    onChange(t.typeId, t.typeCode, t.referenceTarget)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === t.typeId ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <div>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{t.typeCode}</span>
                      <span>{t.typeName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">→ {t.referenceTarget}</span>
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
