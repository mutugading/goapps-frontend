"use client"

import { Badge } from "@/components/ui/badge"
import type { RunDiffSummary as RunDiffSummaryData } from "@/types/generated/payroll/v1/run"

import { formatNominal } from "./payroll-format"

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}

/** Category counts, take-home totals, parity verdict and D-47/D-50 exclusions of a run diff. */
export function RunDiffSummary({ summary }: { summary: RunDiffSummaryData }) {
  const cats = Object.entries(summary.categories).sort(([a], [b]) => a.localeCompare(b))
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Parity">
          <Badge variant={summary.parity ? "default" : "destructive"}>{summary.parity ? "PARITY" : "NOT PARITY"}</Badge>
        </Stat>
        <Stat label="Employees (against / run)">
          {summary.nikLegacy} / {summary.nikTarget}
        </Stat>
        <Stat label="Header mismatches">{summary.headMismatch}</Stat>
        <Stat label="Take-home delta">
          <span className="font-mono">{formatNominal(summary.takeHomeDelta)}</span>
        </Stat>
        <Stat label="Take-home (against)">
          <span className="font-mono">{formatNominal(summary.takeHomeLegacy)}</span>
        </Stat>
        <Stat label="Take-home (run)">
          <span className="font-mono">{formatNominal(summary.takeHomeTarget)}</span>
        </Stat>
      </dl>

      <div>
        <p className="mb-2 text-sm font-medium">Lines per category</p>
        {cats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lines</p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="Category counts">
            {cats.map(([cat, n]) => (
              <li key={cat}>
                <Badge variant={cat === "MATCH" ? "secondary" : "outline"}>
                  {cat}: {n}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {summary.excluded.length > 0 && (
        <div className="rounded-md border p-3">
          <p className="mb-2 text-sm font-medium">Excluded from parity (D-47 / D-50)</p>
          <ul className="space-y-1 text-sm">
            {summary.excluded.map((x) => (
              <li key={x.reason}>
                <span className="font-mono">{x.reason}</span>: {x.nik} NIK, {x.lines} lines, {x.otherLines} other lines,{" "}
                {x.headMismatch} header mismatches, take-home delta{" "}
                <span className="font-mono">{formatNominal(x.takeHomeDelta)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
