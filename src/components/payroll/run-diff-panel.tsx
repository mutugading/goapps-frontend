"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePayrollRunDiff } from "@/hooks/payroll"
import { useDebounce } from "@/lib/hooks"

import { DIFF_CATEGORIES, buildAgainst } from "./payroll-format"
import { RunDiffSummary } from "./run-diff-summary"
import { RunDiffTable } from "./run-diff-table"

const ALL = "__all__"
type Mode = "active" | "legacy" | "run"

/** Diff tab of a payroll run: against ACTIVE / LEGACY / another run of the period (07§4, T030c). */
export function RunDiffPanel({ runId }: { runId: number }) {
  const [mode, setMode] = useState<Mode>("active")
  const [againstRunInput, setAgainstRunInput] = useState("")
  const [category, setCategory] = useState("")
  const [nikInput, setNikInput] = useState("")
  const nik = useDebounce(nikInput.trim(), 400)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const againstRun = useDebounce(againstRunInput, 400)
  const against = buildAgainst(mode, againstRun)
  const diff = usePayrollRunDiff(
    runId,
    { against, nik: nik || undefined, category: category || undefined, page, pageSize },
    against !== undefined
  )
  const d = diff.data?.data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diff</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={mode}
            onValueChange={(v) => {
              setMode(v as Mode)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[190px]" aria-label="Against">
              <SelectValue placeholder="Against" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Against ACTIVE run</SelectItem>
              <SelectItem value="legacy">Against LEGACY run</SelectItem>
              <SelectItem value="run">Against run #...</SelectItem>
            </SelectContent>
          </Select>
          {mode === "run" && (
            <Input
              aria-label="Against run id"
              placeholder="Run id"
              inputMode="numeric"
              className="w-[120px]"
              value={againstRunInput}
              onChange={(e) => {
                setAgainstRunInput(e.target.value)
                setPage(1)
              }}
            />
          )}
          <Select
            value={category || ALL}
            onValueChange={(v) => {
              setCategory(v === ALL ? "" : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]" aria-label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {DIFF_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            aria-label="Filter diff by NIK"
            placeholder="Filter by NIK"
            className="w-[200px]"
            value={nikInput}
            onChange={(e) => {
              setNikInput(e.target.value)
              setPage(1)
            }}
          />
        </div>

        {against === undefined ? (
          <p className="text-sm text-muted-foreground">Enter a valid run id to compare.</p>
        ) : diff.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {diff.error instanceof Error ? diff.error.message : "Failed to load diff"}
          </p>
        ) : (
          <>
            {d?.summary && (
              <p className="text-sm text-muted-foreground">
                Run #{d.runId} vs {d.against || "active"} (#{d.againstRunId})
              </p>
            )}
            {d?.summary && <RunDiffSummary summary={d.summary} />}
            {d && d.warnings.length > 0 && (
              <div role="alert" className="rounded-md border border-yellow-500/50 p-3">
                <p className="mb-1 text-sm font-medium">Warnings ({d.warnings.length})</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {d.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            <RunDiffTable
              data={d?.lines ?? []}
              isLoading={diff.isLoading}
              pagination={diff.data?.pagination}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s)
                setPage(1)
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
