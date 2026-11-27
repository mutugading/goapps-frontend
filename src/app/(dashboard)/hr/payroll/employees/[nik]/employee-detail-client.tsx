"use client"

// Payroll employee detail (T033n3/T033n4): read-only master data, the tax-status history (D-82 (1)) and the backdated
// tax-status correction for holders of payroll.master.taxstatus.update (D-82 (6)). Full employee UI (list/edit) is B-UI1.

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { TaxHistoryTable, TaxStatusCorrectionDialog } from "@/components/payroll"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PERMISSION_TAX_STATUS_UPDATE, usePayrollEmployee } from "@/hooks/payroll"
import { usePermissionContext } from "@/providers/permission-provider"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children || "-"}</dd>
    </div>
  )
}

export default function EmployeeDetailClient({ nik }: { nik: string }) {
  const { hasPermission } = usePermissionContext()
  const canCorrectTax = hasPermission(PERMISSION_TAX_STATUS_UPDATE)
  const [correctOpen, setCorrectOpen] = useState(false)
  const employee = usePayrollEmployee(nik)
  const e = employee.data

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader title={e ? e.nama : `Employee ${nik}`} subtitle={e ? `${e.nik} - ${e.division}` : undefined}>
        <Button variant="outline" asChild>
          <Link href="/hr/payroll/runs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      {employee.isError && (
        <p role="alert" className="text-sm text-destructive">
          {employee.error instanceof Error ? employee.error.message : "Failed to load employee"}
        </p>
      )}
      {employee.isLoading && <div className="h-48 animate-pulse rounded-md bg-muted" />}
      {!employee.isLoading && !employee.isError && !e && <EmptyState title="Employee not found" />}

      {e && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Field label="NIK">{e.nik}</Field>
                <Field label="Division">{e.division}</Field>
                <Field label="Department">{e.dept}</Field>
                <Field label="Designation">{e.designation}</Field>
                <Field label="Grade / Level">{[e.grade, e.level].filter(Boolean).join(" / ")}</Field>
                <Field label="Employment status">{e.employmentStatus}</Field>
                <Field label="Date joined">{e.dateJoin}</Field>
                <Field label="Resign date">{e.resignDate}</Field>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">Tax status</CardTitle>
              {canCorrectTax && (
                <Button variant="outline" size="sm" onClick={() => setCorrectOpen(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Correct tax status
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Field label="Current status (EMPTAX)">{e.taxId}</Field>
                <Field label="Last updated">{e.audit?.updatedAt}</Field>
                <Field label="Updated by">{e.audit?.updatedBy}</Field>
              </dl>
              <h3 className="mb-2 mt-5 text-xs font-semibold text-muted-foreground">History</h3>
              <TaxHistoryTable employeeId={e.id} />
              <p className="mt-3 text-xs text-muted-foreground">
                Each correction is recorded in the tax-status history and the audit log
                (<span className="font-mono">TAX_STATUS_CORRECT</span>).
              </p>
            </CardContent>
          </Card>

          {canCorrectTax && correctOpen && <TaxStatusCorrectionDialog employee={e} onOpenChange={setCorrectOpen} />}
        </>
      )}
    </div>
  )
}
