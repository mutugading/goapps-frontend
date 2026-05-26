"use client"

import { useState } from "react"
import { CheckCircle2, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useApproveCost,
  useCostResult,
  useVerifyCost,
} from "@/hooks/finance/use-cost-calc"
import { usePermissionContext } from "@/providers/permission-provider"
import type { CalculationType } from "@/types/finance/cost-calc"

import { CostBreakdownModal } from "./cost-breakdown-modal"
import { CostHistoryTab } from "./cost-history-tab"
import { formatDate, formatNumeric } from "./format"

interface Props {
  productSysId: number
  period: string
  calcType: CalculationType
}

export function CostResultDetail({ productSysId, period, calcType }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const { hasPermission } = usePermissionContext()
  const { data: result, isLoading } = useCostResult(productSysId, period, calcType)
  const verify = useVerifyCost()
  const approve = useApproveCost()

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>
  }
  if (!result) {
    return (
      <div className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No active cost result for {period} / {calcType}. Trigger a calc job to compute
        one.
      </div>
    )
  }

  const canVerify =
    result.status === "CALCULATED" && hasPermission("finance.cost.result.verify")
  const canApprove =
    result.status === "VERIFIED" && hasPermission("finance.cost.result.approve")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="font-mono text-sm text-muted-foreground mr-2">
              {result.productCode}
            </span>
            {result.productName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat
              label="Cost per unit"
              value={`${result.currencyCode || ""} ${formatNumeric(result.costPerUnit)}`.trim()}
              highlight
            />
            <Stat label="Total RM cost" value={formatNumeric(result.totalRmCost)} />
            <Stat label="Conversion" value={formatNumeric(result.totalConversion)} />
            <Stat label="Total cost" value={formatNumeric(result.totalCost)} />
            <Stat label="Version" value={`v${result.version}`} />
            <Stat label="Status" value={<Badge>{result.status}</Badge>} />
            <Stat label="Calculated" value={formatDate(result.calculatedAt)} />
            <Stat label="By" value={result.calculatedBy || "—"} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              View breakdown
            </Button>
            {canVerify && (
              <Button
                onClick={() => verify.mutate({ costId: result.costId })}
                disabled={verify.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {verify.isPending ? "Verifying…" : "Mark verified"}
              </Button>
            )}
            {canApprove && (
              <Button
                onClick={() => approve.mutate({ costId: result.costId })}
                disabled={approve.isPending}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                {approve.isPending ? "Approving…" : "Mark approved"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History (all versions)</CardTitle>
        </CardHeader>
        <CardContent>
          <CostHistoryTab productSysId={productSysId} calcType={calcType} />
        </CardContent>
      </Card>

      <CostBreakdownModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        productSysId={productSysId}
        period={period}
        calcType={calcType}
      />
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
