"use client"

// RequestTypeCombobox — picks a CostRequestType (QUOTE or DEVELOPMENT) by code+name.
// Used during product request creation. NO UUID input — emits typeId only.
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCostRequestTypes } from "@/hooks/finance/use-cost-request-type"
import { cn } from "@/lib/utils"

interface Props {
  value: number | undefined
  onChange: (typeId: number, code: string, variant: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RequestTypeCombobox({ value, onChange, placeholder = "Select request type…", disabled, className }: Props) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useCostRequestTypes()
  const items = data ?? []
  const selected = useMemo(() => items.find((t) => t.typeId === value), [items, value])

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
              <span className="text-muted-foreground">{selected.code}</span> — {selected.displayName}
              <span className="ml-2 text-xs text-muted-foreground">[{selected.stateMachineVariant}]</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            <CommandEmpty>No type matches.</CommandEmpty>
            <CommandGroup>
              {items.map((t) => (
                <CommandItem
                  key={t.typeId}
                  value={`${t.code} ${t.displayName}`}
                  onSelect={() => {
                    onChange(t.typeId, t.code, t.stateMachineVariant)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === t.typeId ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <div>
                      <span className="font-mono text-xs mr-2 text-muted-foreground">{t.code}</span>
                      <span>{t.displayName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.stateMachineVariant}</span>
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
