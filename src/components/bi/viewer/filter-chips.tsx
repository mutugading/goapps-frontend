"use client"

// FilterChips — chip-based filter row for a single group dimension (e.g. Delivery Type, Category).

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FilterChipsProps {
  label: string
  values: string[]
  selected: string[]
  onToggle: (value: string) => void
  onSelectAll: () => void
}

export function FilterChips({ label, values, selected, onToggle, onSelectAll }: FilterChipsProps) {
  const allSelected = selected.length === 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-[90px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}:
      </span>
      <Badge
        variant={allSelected ? "default" : "outline"}
        className="cursor-pointer select-none text-xs"
        onClick={onSelectAll}
      >
        All
      </Badge>
      {values.map((v) => {
        const active = !allSelected && selected.includes(v)
        return (
          <Badge
            key={v}
            variant={active ? "default" : "outline"}
            className={cn(
              "cursor-pointer select-none text-xs",
              !allSelected && !active && "opacity-40",
            )}
            onClick={() => onToggle(v)}
          >
            {v}
          </Badge>
        )
      })}
    </div>
  )
}
