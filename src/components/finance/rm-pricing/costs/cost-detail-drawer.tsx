"use client"

import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { RMCost, RMCostHistory } from "@/types/finance/rm-cost"
import { RM_COST_TRIGGER_REASON_LABELS } from "@/types/finance/rm-cost"
import { RM_GROUP_FLAG_LABELS } from "@/types/finance/rm-group"
import { RMGroupFlag } from "@/types/generated/finance/v1/rm_group"

interface CostDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cost: RMCost | null
  defaultTab?: "detail" | "history"
  history?: RMCostHistory[]
  isHistoryLoading?: boolean
}

function formatVal(val: number | undefined, digits = 6): string {
  if (val === undefined || val === null) return "—"
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  })
}

function flagLabel(flag: number | undefined): string {
  if (flag === undefined) return "—"
  return RM_GROUP_FLAG_LABELS[flag as RMGroupFlag] || "—"
}

function formatDateTime(ts: string | undefined): string {
  if (!ts) return "—"
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ts
  }
}

function RateRow({ label, value }: { label: string; value: number | undefined }) {
  const isZero = (value ?? 0) === 0
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${isZero ? "text-muted-foreground/50" : ""}`}>
        {formatVal(value)}
      </span>
    </div>
  )
}

function CostRow({
  label,
  value,
  flag,
  flagUsed,
}: {
  label: string
  value: number | undefined
  flag: number | undefined
  flagUsed: number | undefined
}) {
  const cascaded = flag !== flagUsed
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1 text-xs">
          <Badge variant="outline" className="text-[10px]">
            {flagLabel(flag)}
          </Badge>
          {cascaded && (
            <>
              <span className="text-muted-foreground">→</span>
              <Badge variant="secondary" className="text-[10px]">
                {flagLabel(flagUsed)}
              </Badge>
            </>
          )}
        </div>
      </div>
      <span className="font-mono text-sm font-medium">{formatVal(value, 4)}</span>
    </div>
  )
}

export function CostDetailDrawer({
  open,
  onOpenChange,
  cost,
  defaultTab = "detail",
  history,
  isHistoryLoading,
}: CostDetailDrawerProps) {
  if (!cost) return null

  const rates = cost.rates

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-6"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="font-mono">{cost.rmCode}</SheetTitle>
          <SheetDescription>
            Period {cost.period} • {cost.rmName || "—"}
          </SheetDescription>
        </SheetHeader>

        <Tabs key={`${cost.rmCostId}-${defaultTab}`} defaultValue={defaultTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detail">Detail</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="detail" className="mt-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Stage Rates (Aggregated)</h4>
              <div className="rounded-md border p-3 bg-muted/30">
                <RateRow label="CONS" value={rates?.cons} />
                <RateRow label="STORES" value={rates?.stores} />
                <RateRow label="DEPT" value={rates?.dept} />
                <RateRow label="PO_1" value={rates?.po1} />
                <RateRow label="PO_2" value={rates?.po2} />
                <RateRow label="PO_3" value={rates?.po3} />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Landed Costs</h4>
              <div className="rounded-md border p-3 space-y-1">
                <CostRow
                  label="Valuation"
                  value={cost.costValuation}
                  flag={cost.flagValuation}
                  flagUsed={cost.flagValuationUsed}
                />
                <Separator />
                <CostRow
                  label="Marketing"
                  value={cost.costMarketing}
                  flag={cost.flagMarketing}
                  flagUsed={cost.flagMarketingUsed}
                />
                <Separator />
                <CostRow
                  label="Simulation"
                  value={cost.costSimulation}
                  flag={cost.flagSimulation}
                  flagUsed={cost.flagSimulationUsed}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Metadata</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UOM</span>
                  <span>{cost.uomCode || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calculated At</span>
                  <span className="text-xs">{formatDateTime(cost.calculatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calculated By</span>
                  <span className="text-xs">{cost.calculatedBy || "—"}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !history || history.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No history records for this RM code in {cost.period}.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Calculated</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Valuation</TableHead>
                      <TableHead className="text-right">Marketing</TableHead>
                      <TableHead className="text-right">Simulation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.historyId}>
                        <TableCell className="text-xs">
                          {formatDateTime(h.calculatedAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {RM_COST_TRIGGER_REASON_LABELS[h.triggerReason] || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <div>{formatVal(h.costValuation, 4)}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {flagLabel(h.flagValuationUsed)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <div>{formatVal(h.costMarketing, 4)}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {flagLabel(h.flagMarketingUsed)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          <div>{formatVal(h.costSimulation, 4)}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {flagLabel(h.flagSimulationUsed)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
