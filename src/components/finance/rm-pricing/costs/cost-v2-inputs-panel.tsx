"use client"

// V2: Editable per-row marketing inputs + simulation_rate + flags.
// Saving recomputes SP/PP/FP, cost_mark, cost_sim in-place (no full recalc).

import { useState } from "react"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { RMCost } from "@/types/finance/rm-cost"
import {
  RM_VALUATION_FLAG_OPTIONS,
  RM_MARKETING_FLAG_OPTIONS,
} from "@/types/finance/rm-group"
import {
  RMValuationFlag,
  RMMarketingFlag,
  rMValuationFlagToJSON,
  rMMarketingFlagToJSON,
} from "@/types/generated/finance/v1/rm_group"
import { useUpdateRMCostInputs } from "@/hooks/finance/use-rm-cost"

interface CostV2InputsPanelProps {
  cost: RMCost
}

interface FormState {
  marketingFreightRate: string
  marketingAntiDumpingPct: string
  marketingDutyPct: string
  marketingTransportRate: string
  marketingDefaultValue: string
  simulationRate: string
  valuationFlag: RMValuationFlag
  marketingFlag: RMMarketingFlag
}

function toStr(v: number | undefined): string {
  if (v === undefined || v === null) return ""
  return String(v)
}

function toNumOrNull(v: string): number | null {
  if (v.trim() === "") return null
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

/** Decimal stored (0.04) → whole-percent UI string ("4"). */
function pctStrFromDecimal(v: number | undefined): string {
  if (v === undefined || v === null) return ""
  return String(Math.round(v * 100 * 1e6) / 1e6)
}

/** Whole-percent UI string ("4") → decimal storage (0.04). */
function decimalFromPctStr(v: string): number | null {
  if (v.trim() === "") return null
  const n = parseFloat(v)
  if (!Number.isFinite(n)) return null
  return Math.round((n / 100) * 1e8) / 1e8
}

function flagFromCost(value: number | undefined): RMValuationFlag {
  return (value ?? RMValuationFlag.RM_VALUATION_FLAG_UNSPECIFIED) as RMValuationFlag
}

function marketingFlagFromCost(value: number | undefined): RMMarketingFlag {
  return (value ?? RMMarketingFlag.RM_MARKETING_FLAG_UNSPECIFIED) as RMMarketingFlag
}

export function CostV2InputsPanel({ cost }: CostV2InputsPanelProps) {
  // anti / duty are stored as decimal but displayed in whole percent.
  const [form, setForm] = useState<FormState>(() => ({
    marketingFreightRate: toStr(cost.marketingFreightRate),
    marketingAntiDumpingPct: pctStrFromDecimal(cost.marketingAntiDumpingPct),
    marketingDutyPct: pctStrFromDecimal(cost.marketingDutyPct),
    marketingTransportRate: toStr(cost.marketingTransportRate),
    marketingDefaultValue: toStr(cost.marketingDefaultValue),
    simulationRate: toStr(cost.simulationRate),
    valuationFlag: flagFromCost(cost.valuationFlag),
    marketingFlag: marketingFlagFromCost(cost.marketingFlag),
  }))

  // NOTE: This component is remounted via key={cost.rmCostId} when the cost
  // row changes, so initial state from useState's lazy initializer is enough —
  // no useEffect-driven reset needed.

  const updateMutation = useUpdateRMCostInputs()

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      rmCostId: cost.rmCostId,
      marketingFreightRate: toNumOrNull(form.marketingFreightRate) ?? undefined,
      marketingAntiDumpingPct: decimalFromPctStr(form.marketingAntiDumpingPct) ?? undefined,
      marketingDutyPct: decimalFromPctStr(form.marketingDutyPct) ?? undefined,
      marketingTransportRate: toNumOrNull(form.marketingTransportRate) ?? undefined,
      marketingDefaultValue: toNumOrNull(form.marketingDefaultValue) ?? undefined,
      simulationRate: toNumOrNull(form.simulationRate) ?? undefined,
      valuationFlag: rMValuationFlagToJSON(form.valuationFlag),
      marketingFlag: rMMarketingFlagToJSON(form.marketingFlag),
      // Send clear flags when input is empty, so backend forces NULL.
      clearMarketingFreightRate: form.marketingFreightRate.trim() === "",
      clearMarketingAntiDumpingPct: form.marketingAntiDumpingPct.trim() === "",
      clearMarketingDutyPct: form.marketingDutyPct.trim() === "",
      clearMarketingTransportRate: form.marketingTransportRate.trim() === "",
      clearMarketingDefaultValue: form.marketingDefaultValue.trim() === "",
      clearSimulationRate: form.simulationRate.trim() === "",
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-medium mb-2">Marketing Inputs</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Edits recompute SP / PP / FP, cost_mark, and cost_sim in place — no full recalc needed.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Marketing Freight Rate</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.marketingFreightRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingFreightRate: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Marketing Anti Dumping %</Label>
            <Input
              type="number"
              step="0.01"
              value={form.marketingAntiDumpingPct}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingAntiDumpingPct: e.target.value }))
              }
              placeholder="e.g. 5"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Marketing Duty %</Label>
            <Input
              type="number"
              step="0.01"
              value={form.marketingDutyPct}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingDutyPct: e.target.value }))
              }
              placeholder="e.g. 5"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Marketing Transport Rate</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.marketingTransportRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingTransportRate: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Marketing Default Value</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.marketingDefaultValue}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingDefaultValue: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Simulation Rate</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.simulationRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, simulationRate: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Valuation Flag</Label>
          <Select
            value={String(form.valuationFlag)}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, valuationFlag: Number(v) as RMValuationFlag }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RM_VALUATION_FLAG_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Marketing Flag</Label>
          <Select
            value={String(form.marketingFlag)}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, marketingFlag: Number(v) as RMMarketingFlag }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RM_MARKETING_FLAG_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full">
        {updateMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save inputs
      </Button>
    </div>
  )
}
