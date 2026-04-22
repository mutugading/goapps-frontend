"use client"

import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useTriggerRMCost } from "@/hooks/finance/use-rm-cost-trigger"
import { RMCostTriggerReason } from "@/types/finance/rm-cost"

interface CostRecalculateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPeriod?: string
  defaultGroupHeadId?: string
  availablePeriods?: string[]
}

export function CostRecalculateDialog({
  open,
  onOpenChange,
  defaultPeriod = "",
  defaultGroupHeadId,
  availablePeriods = [],
}: CostRecalculateDialogProps) {
  const [period, setPeriod] = useState(defaultPeriod)
  const triggerMutation = useTriggerRMCost()

  const handleTrigger = async () => {
    if (!period) return

    try {
      await triggerMutation.mutateAsync({
        period,
        groupHeadId: defaultGroupHeadId,
        triggerReason: RMCostTriggerReason.RM_COST_TRIGGER_REASON_MANUAL_UI,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to trigger recalculation:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Recalculate RM Costs</DialogTitle>
          <DialogDescription>
            {defaultGroupHeadId
              ? "Recalculate costs for this group for the selected period."
              : "Recalculate costs for all groups for the selected period."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recalc-period">Period</Label>
            {availablePeriods.length > 0 ? (
              <Select
                value={period}
                onValueChange={setPeriod}
              >
                <SelectTrigger id="recalc-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeriods.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="recalc-period"
                placeholder="e.g., 202601"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                maxLength={6}
                className="font-mono"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Format: YYYYMM (e.g., 202601)
            </p>
          </div>

          {!defaultGroupHeadId && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                ⚠️ This will recalculate costs for <strong>all active groups</strong>{" "}
                for the selected period. This may take a few seconds.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={triggerMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTrigger}
            disabled={!period || triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Recalculate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
