"use client"

import { ArrowRight, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserName } from "@/components/common/user-name"
import { useCostBreakdown } from "@/hooks/finance/use-cost-calc"
import { useCostProductMaster } from "@/hooks/finance/use-cost-product-master"
import { useProductRequiredParams } from "@/hooks/finance/use-cost-product-parameter"
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
  const s = breakdown?.summary

  // Same fallback as detail page — breakdown summary may also have empty code/name.
  const needsFallback = s != null && (!s.productCode || !s.productName)
  const { data: productMaster } = useCostProductMaster(needsFallback ? productSysId : undefined)
  const productCode = s?.productCode || productMaster?.productCode || `#${productSysId}`
  const productName = s?.productName || productMaster?.productName || ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl"
      >
        {/* ── Sticky header ── same structure as FillParamDrawer */}
        <div className="flex shrink-0 items-start gap-3 border-b bg-background px-6 py-4">
          <div className="min-w-0 flex-1 space-y-1">
            <SheetTitle className="text-base font-semibold leading-tight">
              {productName || productCode}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {productName ? `${productCode}  ·  ` : ""}Period {period} · {calcType}
              {s?.version !== undefined ? ` · v${s.version}` : ""}
            </SheetDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        )}

        {/* ── Tabs + scrollable content ── */}
        {!isLoading && breakdown && (
          <Tabs
            defaultValue="summary"
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Tab list — sticky below header, standard shadcn TabsList */}
            <div className="shrink-0 border-b bg-background px-4 py-3">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="by-level">
                  By level
                  <span className="ml-1 text-xs opacity-60">{breakdown.byLevel.length}</span>
                </TabsTrigger>
                <TabsTrigger value="rm">
                  RM
                  <span className="ml-1 text-xs opacity-60">{breakdown.rmDetails.length}</span>
                </TabsTrigger>
                <TabsTrigger value="formula">
                  Formula
                  <span className="ml-1 text-xs opacity-60">{breakdown.formulaTrace.length}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable panels — only the active TabsContent is visible */}
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="summary" className="m-0 px-6 py-5">
                <SummaryTab breakdown={breakdown} productSysId={productSysId} />
              </TabsContent>
              <TabsContent value="by-level" className="m-0 px-6 py-5">
                <ByLevelTab rows={breakdown.byLevel} />
              </TabsContent>
              <TabsContent value="rm" className="m-0 px-6 py-5">
                <RmTab rows={breakdown.rmDetails} />
              </TabsContent>
              <TabsContent value="formula" className="m-0 px-6 py-5">
                <FormulaTraceTab rows={breakdown.formulaTrace} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Summary tab ───────────────────────────────────────────────────────────────

function SummaryTab({ breakdown, productSysId }: { breakdown: CostBreakdown; productSysId: number }) {
  const s = breakdown.summary
  const snapshotEntries = Object.entries(breakdown.paramSnapshot)

  // Fetch parameter definitions for this product (already sorted by display_group,
  // capp_display_order, param_code from the backend query).
  const { data: requiredParams = [] } = useProductRequiredParams(productSysId)

  // Walk requiredParams in backend order (sorted by display_order, param_code).
  // Params in the snapshot but NOT in requiredParams go at the end ungrouped.
  const snapshotMap = new Map(snapshotEntries)
  const seenCodes = new Set<string>()
  const orderedEntries: Array<{ code: string; value: string; group: string; order: number }> = []

  for (const p of requiredParams) {
    const value = snapshotMap.get(p.paramCode)
    if (value !== undefined) {
      orderedEntries.push({ code: p.paramCode, value, group: p.displayGroup, order: p.displayOrder })
      seenCodes.add(p.paramCode)
    }
  }
  // Remaining snapshot entries not covered by requiredParams — ungrouped at end
  for (const [k, v] of snapshotEntries) {
    if (!seenCodes.has(k)) {
      orderedEntries.push({ code: k, value: v, group: "", order: 9999 })
    }
  }

  // Group while collecting the minimum display_order seen per group.
  // This lets us sort groups by their first-appearing param's order (not alphabetically).
  const groupMinOrder: Record<string, number> = {}
  const grouped: Record<string, Array<[string, string]>> = {}
  for (const { code, value, group, order } of orderedEntries) {
    if (!grouped[group]) {
      grouped[group] = []
      groupMinOrder[group] = order
    } else {
      groupMinOrder[group] = Math.min(groupMinOrder[group], order)
    }
    grouped[group].push([code, value])
  }
  // Sort groups by their minimum display_order: named groups first (by order), ungrouped last
  const groupEntries = Object.keys(grouped)
    .sort((a, b) => {
      if (!a && !b) return 0
      if (!a) return 1   // ungrouped after all named groups
      if (!b) return -1
      return (groupMinOrder[a] ?? 9999) - (groupMinOrder[b] ?? 9999)
    })
    .map((g) => [g, grouped[g]] as [string, [string, string][]])
  const namedGroupCount = groupEntries.filter(([g]) => g !== "").length

  return (
    <div className="space-y-5">
      {s && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-4">
          <Field label="Cost per unit">
            <span className="text-xl font-semibold tabular-nums">
              {s.currencyCode ? `${s.currencyCode} ` : ""}
              {formatNumeric(s.costPerUnit)}
            </span>
          </Field>
          <Field label="Total RM cost">
            <span className="font-mono tabular-nums">{formatNumeric(s.totalRmCost)}</span>
          </Field>
          <Field label="Conversion">
            <span className="font-mono tabular-nums">{formatNumeric(s.totalConversion)}</span>
          </Field>
          <Field label="Total cost">
            <span className="font-mono font-semibold tabular-nums">{formatNumeric(s.totalCost)}</span>
          </Field>
          <Field label="Calculated">
            <span className="text-muted-foreground">{formatDate(s.calculatedAt)}</span>
          </Field>
          <Field label="By">
            {s.calculatedBy
              ? <UserName userId={s.calculatedBy} compact className="text-muted-foreground" />
              : <span className="text-muted-foreground">—</span>}
          </Field>
          {s.verifiedAt && (
            <Field label="Verified">
              <span className="text-muted-foreground">{formatDate(s.verifiedAt)}</span>
            </Field>
          )}
          {s.verifiedBy && (
            <Field label="Verified by">
              <UserName userId={s.verifiedBy} compact className="text-muted-foreground" />
            </Field>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Parameter snapshot
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {snapshotEntries.length} params
              {namedGroupCount > 0 ? ` · ${namedGroupCount} groups` : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {snapshotEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No parameters captured.</p>
          ) : (
            groupEntries.map(([groupName, entries], idx) => (
              <div key={groupName || "__ungrouped__"} className={idx > 0 ? "mt-5" : ""}>
                {groupName !== "" && (
                  <div className="mb-2 flex items-center gap-2 border-b pb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      {groupName}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {entries.length}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  {entries.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-0"
                    >
                      <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{k}</span>
                      <span className="shrink-0 font-mono text-xs tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── By level tab ──────────────────────────────────────────────────────────────

function ByLevelTab({ rows }: { rows: LevelBreakdown[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No level data.</p>
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Level</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Cost contribution</TableHead>
            <TableHead className="w-28 text-right">Ratio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.level}-${r.productSysId}-${i}`}>
              <TableCell className="font-mono text-sm font-medium">{r.level}</TableCell>
              <TableCell>
                <p className="font-mono text-xs text-muted-foreground">{r.productCode}</p>
                <p className="text-sm">{r.productName}</p>
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatNumeric(r.costContribution)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatNumeric(r.ratio)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ── RM breakdown tab ──────────────────────────────────────────────────────────

function RmTab({ rows }: { rows: CostRmDetail[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No RM data.</p>
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Type</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Shade</TableHead>
            <TableHead className="text-right">Unit cost</TableHead>
            <TableHead className="text-right">Ratio</TableHead>
            <TableHead className="text-right">Contribution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.rmType}-${r.refCode}-${i}`}>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs font-normal">
                  {r.rmType}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="font-mono text-xs text-muted-foreground">{r.refCode}</p>
                <p className="text-sm">{r.refLabel}</p>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {r.shadeCode || "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatNumeric(r.unitCost)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatNumeric(r.ratio)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                {formatNumeric(r.contribution)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ── Formula trace tab — compact card per formula ──────────────────────────────

function FormulaTraceTab({ rows }: { rows: FormulaEval[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No formula evaluations.</p>
  }
  return (
    <div className="space-y-2">
      {rows.map((f, i) => (
        <FormulaCard key={`${f.formulaCode}-${i}`} formula={f} />
      ))}
    </div>
  )
}

function FormulaCard({ formula: f }: { formula: FormulaEval }) {
  const inputEntries = Object.entries(f.inputs ?? {})
  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground">
      {/* Card header row — code + output param */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <code className="shrink-0 font-mono text-xs font-medium text-foreground">
            {f.formulaCode}
          </code>
          {f.formulaName && (
            <span className="truncate text-xs text-muted-foreground">
              · {f.formulaName}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
          <ArrowRight className="h-3.5 w-3.5" />
          <code className="font-mono text-xs">{f.outputParamCode}</code>
        </div>
      </div>

      {/* Card body */}
      <div className="space-y-2.5 px-4 py-3">
        {/* Expression */}
        <pre className="overflow-x-auto rounded-md bg-muted/50 px-3 py-2 font-mono text-xs leading-relaxed">
          {f.expression}
        </pre>

        {/* Inputs — compact inline pairs */}
        {inputEntries.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-xs text-muted-foreground">Inputs:</span>
            {inputEntries.map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1 text-xs">
                <span className="font-mono text-muted-foreground">{k}</span>
                <span className="text-muted-foreground/50">=</span>
                <span className="font-mono font-medium tabular-nums">{v}</span>
              </span>
            ))}
          </div>
        )}

        {/* Output */}
        <div className="flex items-center gap-2 border-t pt-2 text-xs">
          <span className="text-muted-foreground">Output</span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            {formatNumeric(f.outputValue)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
