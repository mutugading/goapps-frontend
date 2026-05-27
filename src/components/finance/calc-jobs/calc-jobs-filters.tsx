"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import type { CalcJobStatus, CalculationType } from "@/types/finance/cost-calc"

export interface CalcJobsFiltersValue {
  period?: string
  calculationType?: CalculationType | ""
  status?: CalcJobStatus | ""
  triggeredBy?: string
}

interface Props {
  value: CalcJobsFiltersValue
  onChange: (next: CalcJobsFiltersValue) => void
}

const CALC_TYPES: CalculationType[] = ["ACTUAL", "FORECAST", "SELLING"]
const STATUSES: CalcJobStatus[] = [
  "QUEUED",
  "PLANNING",
  "PROCESSING",
  "SUCCESS",
  "PARTIAL_FAILED",
  "FAILED",
  "CANCELLED",
]

export function CalcJobsFilters({ value, onChange }: Props) {
  const hasFilters = Boolean(
    value.period || value.calculationType || value.status || value.triggeredBy,
  )

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Period</label>
          <Input
            placeholder="YYYYMM"
            value={value.period ?? ""}
            onChange={(e) => onChange({ ...value, period: e.target.value })}
            className="w-32"
            maxLength={6}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Calc type</label>
          <Select
            value={value.calculationType || "ALL"}
            onValueChange={(v) =>
              onChange({
                ...value,
                calculationType: v === "ALL" ? "" : (v as CalculationType),
              })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {CALC_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <Select
            value={value.status || "ALL"}
            onValueChange={(v) =>
              onChange({
                ...value,
                status: v === "ALL" ? "" : (v as CalcJobStatus),
              })
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Triggered by</label>
          <Input
            placeholder="MANUAL / CRON / API"
            value={value.triggeredBy ?? ""}
            onChange={(e) => onChange({ ...value, triggeredBy: e.target.value })}
            className="w-44"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ period: "", calculationType: "", status: "", triggeredBy: "" })
            }
          >
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>
    </Card>
  )
}
