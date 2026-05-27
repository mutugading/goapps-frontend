"use client"

// PaperTubeTypeCombobox — picks a CostPaperTubeType by code+label. NO UUID input.
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCostPaperTubeTypes } from "@/hooks/finance/use-cost-paper-tube-type"
import { cn } from "@/lib/utils"

interface Props {
  value: number | undefined
  onChange: (paperTubeTypeId: number, code: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PaperTubeTypeCombobox({ value, onChange, placeholder = "Select paper tube…", disabled, className }: Props) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useCostPaperTubeTypes()
  const items = data ?? []
  const selected = useMemo(() => items.find((t) => t.paperTubeTypeId === value), [items, value])

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
            <CommandEmpty>No paper tube matches.</CommandEmpty>
            <CommandGroup>
              {items.map((t) => (
                <CommandItem
                  key={t.paperTubeTypeId}
                  value={`${t.code} ${t.displayName}`}
                  onSelect={() => {
                    onChange(t.paperTubeTypeId, t.code)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === t.paperTubeTypeId ? "opacity-100" : "opacity-0")} />
                  <span className="font-mono text-xs mr-2 text-muted-foreground">{t.code}</span>
                  <span>{t.displayName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
