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

import { PAYROLL_DIVISIONS, RUN_STATUSES } from "./payroll-format"

export interface RunsFilterValues {
  yymm: string
  division: string
  status: string
}

interface RunsFiltersProps {
  filters: RunsFilterValues
  onFiltersChange: (filters: RunsFilterValues) => void
  /** Hides the status filter (periods page has none). */
  showStatus?: boolean
}

const ALL = "all"

export function RunsFilters({ filters, onFiltersChange, showStatus = true }: RunsFiltersProps) {
  const hasFilters = filters.yymm !== "" || filters.division !== "" || filters.status !== ""

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        aria-label="Period (yyyymm)"
        placeholder="Period yyyymm"
        inputMode="numeric"
        maxLength={7}
        className="w-[150px]"
        value={filters.yymm}
        onChange={(e) => onFiltersChange({ ...filters, yymm: e.target.value })}
      />
      <Select
        value={filters.division || ALL}
        onValueChange={(v) => onFiltersChange({ ...filters, division: v === ALL ? "" : v })}
      >
        <SelectTrigger className="w-[150px]" aria-label="Division">
          <SelectValue placeholder="Division" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Divisions</SelectItem>
          {PAYROLL_DIVISIONS.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showStatus && (
        <Select
          value={filters.status || ALL}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v === ALL ? "" : v })}
        >
          <SelectTrigger className="w-[160px]" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Statuses</SelectItem>
            {RUN_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({ yymm: "", division: "", status: "" })}
        >
          <X className="mr-1 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  )
}
