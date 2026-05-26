"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCostBreakdown } from "@/hooks/finance/use-cost-calc"
import type {
  CalculationType,
  CostBreakdown,
  CostRmDetail,
  FormulaEval,
  LevelBreakdown,
} from "@/types/finance/cost-calc"

import { formatDate, formatNumeric } from "./format"

interface Props {
  open: boolean
  onOpenChange: (b: boolean) => void
  productSysId: number
  period: string
  calcType: CalculationType
}

export function CostBreakdownModal({
  open,
  onOpenChange,
  productSysId,
  period,
  calcType,
}: Props) {
  const { data: breakdown, isLoading } = useCostBreakdown(
    open ? productSysId : undefined,
    open ? period : undefined,
    open ? calcType : undefined,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Cost breakdown
            {breakdown?.summary
              ? ` — ${breakdown.summary.productCode} (${breakdown.summary.period} / ${breakdown.summary.calculationType})`
              : ""}
          </DialogTitle>
        </DialogHeader>
        {isLoading || !breakdown ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Loading…
          </div>
        ) : (
          <Tabs defaultValue="summary" className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="by-level">
                By level ({breakdown.byLevel.length})
              </TabsTrigger>
              <TabsTrigger value="rm-breakdown">
                RM breakdown ({breakdown.rmDetails.length})
              </TabsTrigger>
              <TabsTrigger value="formula-trace">
                Formula trace ({breakdown.formulaTrace.length})
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="summary">
                <SummaryTab breakdown={breakdown} />
              </TabsContent>
              <TabsContent value="by-level">
                <ByLevelTab rows={breakdown.byLevel} />
              </TabsContent>
              <TabsContent value="rm-breakdown">
                <RmTab rows={breakdown.rmDetails} />
              </TabsContent>
              <TabsContent value="formula-trace">
                <FormulaTraceTab
                  rows={breakdown.formulaTrace}
                  paramSnapshot={breakdown.paramSnapshot}
                />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---------- Summary tab ----------

function SummaryTab({ breakdown }: { breakdown: CostBreakdown }) {
  const s = breakdown.summary
  const snapshotEntries = Object.entries(breakdown.paramSnapshot)
  return (
    <div className="space-y-4">
      {s ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {s.productCode} — {s.productName}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat
              label="Cost per unit"
              value={`${s.currencyCode || ""} ${formatNumeric(s.costPerUnit)}`.trim()}
              highlight
            />
            <Stat label="Total RM cost" value={formatNumeric(s.totalRmCost)} />
            <Stat label="Conversion" value={formatNumeric(s.totalConversion)} />
            <Stat label="Total cost" value={formatNumeric(s.totalCost)} />
            <Stat label="Version" value={`v${s.version}`} />
            <Stat label="Status" value={<Badge>{s.status}</Badge>} />
            <Stat label="Calculated" value={formatDate(s.calculatedAt)} />
            <Stat label="By" value={s.calculatedBy || "—"} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Parameter snapshot ({snapshotEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {snapshotEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground">No parameters captured.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 max-h-96 overflow-auto">
              {snapshotEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b py-1 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground truncate">
                    {k}
                  </span>
                  <span className="font-mono text-xs tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={highlight ? "text-2xl font-semibold tabular-nums" : "text-sm"}>
        {value}
      </div>
    </div>
  )
}

// ---------- By level tab ----------

function ByLevelTab({ rows }: { rows: LevelBreakdown[] }) {
  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No level data.</div>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Level</TableHead>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Cost contribution</TableHead>
          <TableHead className="text-right">Ratio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, idx) => (
          <TableRow key={`${r.level}-${r.productSysId}-${idx}`}>
            <TableCell>{r.level}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-muted-foreground">
                  {r.productCode}
                </span>
                <span>{r.productName}</span>
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumeric(r.costContribution)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumeric(r.ratio)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ---------- RM breakdown tab ----------

function RmTab({ rows }: { rows: CostRmDetail[] }) {
  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No RM data.</div>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>RM Type</TableHead>
          <TableHead>Ref</TableHead>
          <TableHead>Shade</TableHead>
          <TableHead className="text-right">Unit cost</TableHead>
          <TableHead className="text-right">Ratio</TableHead>
          <TableHead className="text-right">Contribution</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, idx) => (
          <TableRow key={`${r.rmType}-${r.refCode}-${idx}`}>
            <TableCell>
              <Badge variant="outline">{r.rmType}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-muted-foreground">
                  {r.refCode}
                </span>
                <span>{r.refLabel}</span>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">{r.shadeCode || "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumeric(r.unitCost)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumeric(r.ratio)}
            </TableCell>
            <TableCell className="text-right tabular-nums font-semibold">
              {formatNumeric(r.contribution)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ---------- Formula trace tab ----------

function FormulaTraceTab({
  rows,
  paramSnapshot: _paramSnapshot,
}: {
  rows: FormulaEval[]
  paramSnapshot: Record<string, string>
}) {
  void _paramSnapshot
  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">No formula evaluations.</div>
  }
  return (
    <div className="space-y-3">
      {rows.map((f, idx) => {
        const inputEntries = Object.entries(f.inputs ?? {})
        return (
          <Card key={`${f.formulaCode}-${idx}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-baseline justify-between gap-2">
                <span>
                  <span className="font-mono text-xs text-muted-foreground mr-2">
                    {f.formulaCode}
                  </span>
                  {f.formulaName}
                </span>
                <span className="text-xs text-muted-foreground">
                  → {f.outputParamCode}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <pre className="bg-muted/40 rounded px-3 py-2 text-xs overflow-x-auto">
                <code>{f.expression}</code>
              </pre>
              {inputEntries.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground mr-2">Inputs:</span>
                  {inputEntries.map(([k, v], i) => (
                    <span key={k} className="inline-block mr-3">
                      <span className="font-mono text-muted-foreground">{k}</span>
                      <span className="mx-1">=</span>
                      <span className="font-mono tabular-nums">{v}</span>
                      {i < inputEntries.length - 1 ? "" : ""}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">Output:</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatNumeric(f.outputValue)}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
