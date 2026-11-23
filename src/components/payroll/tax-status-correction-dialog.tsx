"use client"

// Backdated tax-status correction (D-82 (5)/(6), T033n3). Mounted only while open, so the fields reset on every open.

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

import { FormDialog } from "@/components/shared"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MAX_TAX_REASON, useCorrectTaxStatus } from "@/hooks/payroll"
import type { Employee } from "@/types/generated/payroll/v1/master"

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

interface TaxStatusCorrectionDialogProps {
  employee: Employee
  onOpenChange: (open: boolean) => void
}

export function TaxStatusCorrectionDialog({ employee, onOpenChange }: TaxStatusCorrectionDialogProps) {
  const correct = useCorrectTaxStatus()
  const [taxId, setTaxId] = useState(employee.taxId)
  const [validFrom, setValidFrom] = useState("")
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)

  const code = taxId.trim().toUpperCase()
  const trimmedReason = reason.trim()
  const errors = {
    taxId: code === "" ? "Tax status code is required" : code.length > 10 ? "Max 10 characters" : "",
    validFrom: DATE_RE.test(validFrom) ? "" : "Effective date is required",
    reason:
      trimmedReason === ""
        ? "Reason is required"
        : trimmedReason.length > MAX_TAX_REASON
          ? `Max ${MAX_TAX_REASON} characters`
          : "",
  }
  const invalid = Object.values(errors).some(Boolean)

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title="Correct Tax Status"
      description={`${employee.nama} (${employee.nik}). Current status: ${employee.taxId || "-"}.`}
      submitText="Correct"
      isLoading={correct.isPending}
      onSubmit={async () => {
        setTouched(true)
        if (invalid) return
        try {
          await correct.mutateAsync({ id: employee.id, taxId: code, validFrom, reason: trimmedReason, ifMatch: employee.etag })
          onOpenChange(false)
        } catch {
          // toast shown by the hook; keep the dialog open
        }
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tax-correct-code">Tax status code (EMPTAX)</Label>
          <Input
            id="tax-correct-code"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="e.g. K1"
            maxLength={10}
            aria-invalid={touched && !!errors.taxId}
          />
          {touched && errors.taxId && <p role="alert" className="text-sm text-destructive">{errors.taxId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-correct-from">Effective from</Label>
          <Input
            id="tax-correct-from"
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            aria-invalid={touched && !!errors.validFrom}
          />
          <p className="text-xs text-muted-foreground">Current or previous tax year, not in the future.</p>
          {touched && errors.validFrom && <p role="alert" className="text-sm text-destructive">{errors.validFrom}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-correct-reason">Reason</Label>
          <Textarea
            id="tax-correct-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={MAX_TAX_REASON}
            aria-invalid={touched && !!errors.reason}
          />
          <p className="text-xs text-muted-foreground">
            Recorded in the audit log. Do not include personal data (NPWP, KTP, account numbers).
          </p>
          {touched && errors.reason && <p role="alert" className="text-sm text-destructive">{errors.reason}</p>}
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Correct the same status in HRIS too: the HRIS sync overwrites the employee tax status, so a fix made
            only here can be reverted by the next sync.
          </AlertDescription>
        </Alert>
      </div>
    </FormDialog>
  )
}
