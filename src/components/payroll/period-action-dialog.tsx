"use client"

import { useState } from "react"

import { ConfirmDialog, FormDialog } from "@/components/shared"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApprovePeriod, useClosePeriod, useReopenPeriod } from "@/hooks/payroll"
import type { Period } from "@/types/generated/payroll/v1/run"

import { MIN_REOPEN_REASON, formatYymm } from "./payroll-format"
import type { PeriodDialogAction } from "./periods-table"

interface PeriodActionDialogProps {
  action: PeriodDialogAction | null
  period: Period | null
  onOpenChange: (open: boolean) => void
}

function ReopenDialog({
  period,
  label,
  onOpenChange,
}: {
  period: Period
  label: string
  onOpenChange: (open: boolean) => void
}) {
  const reopen = useReopenPeriod()
  // Mounted only while the dialog is open, so the reason resets on every open.
  const [reason, setReason] = useState("")
  const trimmed = reason.trim()
  const tooShort = trimmed.length < MIN_REOPEN_REASON
  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title="Reopen Payroll Period"
      description={`Reopen ${label}. The period returns to DRAFT and the action is audited.`}
      submitText="Reopen"
      isLoading={reopen.isPending}
      onSubmit={async () => {
        if (tooShort) return
        try {
          await reopen.mutateAsync({ yymm: period.yymm, division: period.division, reason: trimmed })
          onOpenChange(false)
        } catch {
          // toast shown by the hook; keep the dialog open
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="reopen-reason">Reason (min. {MIN_REOPEN_REASON} characters)</Label>
        <Textarea
          id="reopen-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          aria-invalid={reason.length > 0 && tooShort}
        />
        {reason.length > 0 && tooShort && (
          <p role="alert" className="text-sm text-destructive">
            Reason must be at least {MIN_REOPEN_REASON} characters ({trimmed.length}/{MIN_REOPEN_REASON}).
          </p>
        )}
      </div>
    </FormDialog>
  )
}

export function PeriodActionDialog({ action, period, onOpenChange }: PeriodActionDialogProps) {
  const approve = useApprovePeriod()
  const close = useClosePeriod()

  if (!action || !period) return null

  const label = `${formatYymm(period.yymm)} ${period.division}`
  const vars = { yymm: period.yymm, division: period.division }
  const finish = () => onOpenChange(false)

  if (action === "reopen") {
    return <ReopenDialog period={period} label={label} onOpenChange={onOpenChange} />
  }

  const mutation = action === "approve" ? approve : close
  return (
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title={action === "approve" ? "Approve Payroll Period" : "Close Payroll Period"}
      description={
        action === "approve"
          ? `Approve ${label}? The attendance snapshot is locked and run changes are refused until reopened.`
          : `Close ${label}? All related changes are rejected afterwards.`
      }
      variant={action === "close" ? "warning" : "default"}
      confirmText={action === "approve" ? "Approve" : "Close"}
      isLoading={mutation.isPending}
      onConfirm={async () => {
        try {
          await mutation.mutateAsync(vars)
          finish()
        } catch {
          // toast shown by the hook
        }
      }}
    />
  )
}
