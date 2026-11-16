"use client"

import { useState } from "react"
import { toast } from "sonner"

import { DataTable, FormDialog, type ColumnDef } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDryRunPayroll } from "@/hooks/payroll"
import type { Run, RunEmployeeTotal } from "@/types/generated/payroll/v1/run"

import { MAX_DRY_RUN_NIK, PAYROLL_DIVISIONS, formatNominal, formatYymm, parseNikList, parseYymm } from "./payroll-format"

interface DryRunDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Dry run (D-71): calculates a period without saving anything. Mounted only while open, so the form resets. */
export function DryRunDialog({ open, onOpenChange }: DryRunDialogProps) {
  if (!open) return null
  return <DryRunForm onOpenChange={onOpenChange} />
}

const employeeColumns: ColumnDef<RunEmployeeTotal>[] = [
  { id: "nik", header: "NIK", cellClassName: "font-mono", accessorKey: "nik" },
  { id: "name", header: "Name", cell: (row) => row.name || "-" },
  { id: "totalTunjangan", header: "Earnings", headerClassName: "text-right", cellClassName: "text-right font-mono", hideOnMobile: true, cell: (row) => formatNominal(row.totalTunjangan) },
  { id: "totalPotongan", header: "Deductions", headerClassName: "text-right", cellClassName: "text-right font-mono", hideOnMobile: true, cell: (row) => formatNominal(row.totalPotongan) },
  { id: "takeHome", header: "Take Home", headerClassName: "text-right", cellClassName: "text-right font-mono font-medium", cell: (row) => formatNominal(row.takeHome) },
]

function DryRunForm({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const dry = useDryRunPayroll()
  const [yymmInput, setYymmInput] = useState("")
  const [division, setDivision] = useState<string>(PAYROLL_DIVISIONS[0])
  const [nikInput, setNikInput] = useState("")

  const yymm = parseYymm(yymmInput)
  const yymmInvalid = yymmInput !== "" && yymm === undefined
  const niks = parseNikList(nikInput)
  const nikTooMany = niks.length > MAX_DRY_RUN_NIK

  const onSubmit = async () => {
    if (yymm === undefined || nikTooMany) return
    try {
      await dry.mutateAsync({ yymm, division, nik: niks })
    } catch (e) {
      // PERIOD_* / MISSING_ATTENDANCE etc.: show the backend message; keep the dialog open
      toast.error(e instanceof Error ? e.message : "Dry run failed")
    }
  }

  const run = dry.data?.data
  const employees = dry.data?.employees ?? []

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      size="xl"
      title="Dry Run Payroll"
      description="Calculates the period without saving anything: no run, lock, or audit record is created."
      submitText="Run Dry Run"
      cancelText="Close"
      isLoading={dry.isPending}
      onSubmit={onSubmit}
    >
      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dry-yymm">Period (yyyymm)</Label>
            <Input
              id="dry-yymm"
              inputMode="numeric"
              maxLength={7}
              placeholder="202701"
              value={yymmInput}
              onChange={(e) => setYymmInput(e.target.value)}
              aria-invalid={yymmInvalid}
            />
            {yymmInvalid && (
              <p role="alert" className="text-sm text-destructive">
                Use yyyymm, e.g. 202701.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dry-division">Division</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger id="dry-division" aria-label="Division">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYROLL_DIVISIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dry-nik">NIK list (optional, max {MAX_DRY_RUN_NIK})</Label>
          <Textarea
            id="dry-nik"
            rows={3}
            placeholder="Empty = all employees. Separate NIKs with commas, spaces, or new lines."
            value={nikInput}
            onChange={(e) => setNikInput(e.target.value)}
            aria-invalid={nikTooMany}
          />
          {nikTooMany && (
            <p role="alert" className="text-sm text-destructive">
              Too many NIKs ({niks.length}/{MAX_DRY_RUN_NIK}).
            </p>
          )}
        </div>

        {run && <DryRunResult run={run} employees={employees} />}
      </div>
    </FormDialog>
  )
}

function DryRunResult({ run, employees }: { run: Run; employees: RunEmployeeTotal[] }) {
  const warnings = run.warnings ?? []
  return (
    <section aria-label="Dry run result" className="space-y-3 border-t pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold">
          Result {formatYymm(run.yymm)} {run.division}
        </h3>
        <Badge variant="outline">Not saved</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <SummaryItem label="Employees" value={String(run.employeeCount)} />
        <SummaryItem label="Total Earnings" value={formatNominal(run.totalTunjangan)} mono />
        <SummaryItem label="Total Deductions" value={formatNominal(run.totalPotongan)} mono />
        <SummaryItem label="Duration" value={`${run.durationMs} ms`} />
        <SummaryItem label="Rule set" value={run.ruleSetId ? `#${run.ruleSetId}` : "-"} />
      </dl>
      {warnings.length > 0 && (
        <div role="alert" className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium">Warnings ({warnings.length})</p>
          <ul className="list-disc pl-5">
            {warnings.map((w, i) => (
              <li key={`${i}-${w}`}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      <DataTable
        data={employees}
        columns={employeeColumns}
        getRowKey={(row, i) => `${row.nik}-${i}`}
        emptyMessage="No employees calculated"
        emptyDescription="Check the period, division, and NIK list"
      />
    </section>
  )
}

function SummaryItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono font-medium" : "font-medium"}>{value}</dd>
    </div>
  )
}
