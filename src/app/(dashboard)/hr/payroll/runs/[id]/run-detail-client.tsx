"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common/page-header"
import { RunDiffPanel, RunLinesTable, formatNominal, formatYymm, runStatusVariant } from "@/components/payroll"
import { usePayrollRun, usePayrollRunLines } from "@/hooks/payroll"
import { useDebounce } from "@/lib/hooks"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}

export default function RunDetailClient({ id }: { id: string }) {
  const runId = Number(id)
  const validId = Number.isInteger(runId) && runId > 0

  const [nikInput, setNikInput] = useState("")
  const nik = useDebounce(nikInput.trim(), 400)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const run = usePayrollRun(runId)
  const lines = usePayrollRunLines(runId, { nik: nik || undefined, page, pageSize })

  if (!validId) {
    return <p role="alert" className="text-sm text-destructive">Invalid run id</p>
  }

  const r = run.data

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Payroll Run #${runId}`}
        subtitle={r ? `${formatYymm(r.yymm)} - ${r.division}` : undefined}
      >
        <Button variant="outline" asChild>
          <Link href="/hr/payroll/runs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      {run.isError && (
        <p role="alert" className="text-sm text-destructive">
          {run.error instanceof Error ? run.error.message : "Failed to load run"}
        </p>
      )}

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="lines">Lines</TabsTrigger>
          <TabsTrigger value="diff">Diff</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {run.isLoading || !r ? (
                <p className="text-sm text-muted-foreground">{run.isLoading ? "Loading..." : "Run not found"}</p>
              ) : (
                <div className="space-y-4">
                  <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Field label="Status">
                      <Badge variant={runStatusVariant(r.status)}>{r.status}</Badge>
                    </Field>
                    <Field label="Process Date">{r.processDate || "-"}</Field>
                    <Field label="Employees">{r.employeeCount}</Field>
                    <Field label="Lines">{r.lineCount}</Field>
                    <Field label="Total Earnings">
                      <span className="font-mono">{formatNominal(r.totalTunjangan)}</span>
                    </Field>
                    <Field label="Total Deductions">
                      <span className="font-mono">{formatNominal(r.totalPotongan)}</span>
                    </Field>
                    <Field label="Rule Set">{r.ruleSetId || "-"}</Field>
                    <Field label="Snapshot">{r.snapshotId > 0 ? `#${r.snapshotId}` : "-"}</Field>
                    <Field label="Started By">{r.startedBy || "-"}</Field>
                    <Field label="Started">{r.startedAt || "-"}</Field>
                    <Field label="Finished">{r.finishedAt || "-"}</Field>
                    <Field label="Duration">{r.durationMs > 0 ? `${r.durationMs} ms` : "-"}</Field>
                  </dl>
                  {r.nikFilter.length > 0 && (
                    <p className="text-sm text-muted-foreground">NIK filter: {r.nikFilter.join(", ")}</p>
                  )}
                  {r.warnings.length > 0 && (
                    <div role="alert" className="rounded-md border border-yellow-500/50 p-3">
                      <p className="mb-1 text-sm font-medium">Warnings ({r.warnings.length})</p>
                      <ul className="list-disc space-y-1 pl-5 text-sm">
                        {r.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lines">
          <Card>
            <CardHeader>
              <CardTitle>Lines per NIK / component</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                aria-label="Filter by NIK"
                placeholder="Filter by NIK"
                className="w-[220px]"
                value={nikInput}
                onChange={(e) => {
                  setNikInput(e.target.value)
                  setPage(1)
                }}
              />
              {lines.isError ? (
                <p role="alert" className="text-sm text-destructive">
                  {lines.error instanceof Error ? lines.error.message : "Failed to load lines"}
                </p>
              ) : (
                <RunLinesTable
                  data={lines.data?.data ?? []}
                  isLoading={lines.isLoading}
                  pagination={lines.data?.pagination}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s)
                    setPage(1)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diff">
          <RunDiffPanel runId={runId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
