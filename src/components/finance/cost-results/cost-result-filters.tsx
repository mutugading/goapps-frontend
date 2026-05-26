"use client"

import { ProductMasterCombobox } from "@/components/finance/comboboxes/product-master-combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FiltersValue {
  productSysId?: number
  period?: string
  calcType?: string
}

interface Props {
  value: FiltersValue
  onChange: (next: FiltersValue) => void
}

const CALC_TYPES = ["ACTUAL", "FORECAST", "SELLING"] as const

function currentPeriod(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function CostResultFilters({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1 min-w-[280px]">
        <Label className="text-xs text-muted-foreground">Product</Label>
        <ProductMasterCombobox
          value={value.productSysId}
          onChange={(productSysId) => onChange({ ...value, productSysId })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Period (YYYYMM)</Label>
        <Input
          placeholder={currentPeriod()}
          value={value.period ?? ""}
          onChange={(e) =>
            onChange({ ...value, period: e.target.value.replace(/\D/g, "").slice(0, 6) })
          }
          className="w-32 font-mono"
          maxLength={6}
          inputMode="numeric"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Calc type</Label>
        <Select
          value={value.calcType ?? ""}
          onValueChange={(v) => onChange({ ...value, calcType: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {CALC_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
