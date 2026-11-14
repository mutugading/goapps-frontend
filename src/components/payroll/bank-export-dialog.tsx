"use client"

import { useState } from "react"

import { FormDialog } from "@/components/shared"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useExportPayrollReport } from "@/hooks/payroll"
import type { Period } from "@/types/generated/payroll/v1/run"

import { formatYymm } from "./payroll-format"

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

interface BankExportDialogProps {
  period: Period | null
  onOpenChange: (open: boolean) => void
}

/** Asks for the transfer date (cover letter of the bank file) and downloads the bank xlsx (T030d2). */
export function BankExportDialog({ period, onOpenChange }: BankExportDialogProps) {
  if (!period) return null
  return <BankExportForm period={period} onOpenChange={onOpenChange} />
}

function BankExportForm({ period, onOpenChange }: { period: Period; onOpenChange: (open: boolean) => void }) {
  const { download, isDownloading } = useExportPayrollReport()
  // Mounted only while the dialog is open, so the date resets on every open.
  const [date, setDate] = useState("")
  const valid = DATE_RE.test(date)
  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title="Download Bank File"
      description={`Bank transfer file (Mandiri) for ${formatYymm(period.yymm)} ${period.division}. The export is audited.`}
      submitText="Download"
      isLoading={isDownloading}
      onSubmit={async () => {
        if (!valid) return
        const ok = await download({ kind: "bank", yymm: period.yymm, division: period.division, transferDate: date })
        if (ok) onOpenChange(false)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="bank-transfer-date">Transfer date</Label>
        <Input
          id="bank-transfer-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          aria-invalid={date.length > 0 && !valid}
        />
      </div>
    </FormDialog>
  )
}
