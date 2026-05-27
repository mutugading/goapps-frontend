"use client"

// Viewer filter bar — period preset dropdown + custom range + compare toggle.

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type ViewerState,
  type PeriodPreset,
  type CompareKey,
  PERIOD_PRESETS,
  PERIOD_PRESET_LABELS,
  COMPARE_LABELS,
} from "@/types/bi"

interface FilterBarProps {
  state: ViewerState
  onChange: (next: ViewerState) => void
  /** Compare modes the dashboard enables (subset of COMPARE_KEYS). NONE is always available. */
  compareModes: CompareKey[]
}

export function FilterBar({ state, onChange, compareModes }: FilterBarProps) {
  const availableCompares: CompareKey[] = ["NONE", ...compareModes.filter((c) => c !== "NONE")]

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      {/* Period preset */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Period</span>
        <Select
          value={state.period}
          onValueChange={(v) => onChange({ ...state, period: v as PeriodPreset })}
        >
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_PRESETS.map((p) => (
              <SelectItem key={p} value={p}>
                {PERIOD_PRESET_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom date range */}
      {state.period === "CUSTOM" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={state.periodFrom ?? ""}
            onChange={(e) => onChange({ ...state, periodFrom: e.target.value })}
            className="h-8 rounded-md border bg-background px-2 text-sm"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            value={state.periodTo ?? ""}
            onChange={(e) => onChange({ ...state, periodTo: e.target.value })}
            className="h-8 rounded-md border bg-background px-2 text-sm"
          />
        </div>
      )}

      {/* Compare toggle */}
      {availableCompares.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Compare</span>
          <div className="flex rounded-md bg-muted p-0.5">
            {availableCompares.map((c) => (
              <Button
                key={c}
                type="button"
                size="sm"
                variant="ghost"
                className={cn(
                  "h-7 px-3 text-xs",
                  state.compare === c && "bg-background shadow-sm"
                )}
                onClick={() => onChange({ ...state, compare: c })}
              >
                {COMPARE_LABELS[c]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
