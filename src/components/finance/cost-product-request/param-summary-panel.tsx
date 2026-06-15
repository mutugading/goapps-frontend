"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UserName } from "@/components/common/user-name"
import { usePermissionContext } from "@/providers/permission-provider"
import { useParamSummary } from "@/hooks/finance/use-param-summary"
import { OverrideParamsDrawer } from "./override-params-drawer"
import type { FillLevelSummary, ParamValueEntry } from "@/types/finance/param-summary"

interface Props {
  requestId: number
  routeLocked?: boolean
}

interface DrawerState {
  productSysId: number
  productCode: string
  routeLevel: number
  params: ParamValueEntry[]
}

function taskStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge className="border-green-200 bg-green-100 text-[10px] text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          ✓ Approved
        </Badge>
      )
    case "FILLED":
    case "APPROVAL_PENDING":
      return (
        <Badge className="border-yellow-200 bg-yellow-100 text-[10px] text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
          ⏳ Pending
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge className="border-red-200 bg-red-100 text-[10px] text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          ✗ Rejected
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {status || "Active"}
        </Badge>
      )
  }
}

interface LevelSummaryProps {
  level: FillLevelSummary
  canEdit: boolean
  locked: boolean
  onEdit: () => void
}

function LevelSummary({ level, canEdit, locked, onEdit }: LevelSummaryProps) {
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">Level {level.routeLevel}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {level.filledParams}/{level.totalParams}
          </span>
          {taskStatusBadge(level.taskStatus)}
          {canEdit && !locked && level.params.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              title="Edit param values"
              onClick={(e) => { e.stopPropagation(); onEdit() }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-0.5">
        {level.params.map((p) => (
          <div key={p.paramCode} className="flex items-center gap-2">
            <span
              className="w-36 truncate font-mono text-[11px] text-muted-foreground"
              title={p.paramCode}
            >
              {p.paramCode}
            </span>
            {p.hasValue ? (
              <span className="font-mono text-[11px]">
                {p.dataType === "NUMBER"
                  ? p.valueNumeric
                  : p.dataType === "BOOLEAN"
                    ? p.valueFlag
                      ? "true"
                      : "false"
                    : p.valueText}
                {p.uomCode ? ` ${p.uomCode}` : ""}
              </span>
            ) : (
              <span className="font-medium text-destructive">——</span>
            )}
          </div>
        ))}
      </div>
      {level.filledByUserId && (
        <p className="text-[10px] text-muted-foreground">
          Filled by: <UserName userId={level.filledByUserId} compact />
          {level.filledAt ? ` · ${level.filledAt.slice(0, 10)}` : ""}
        </p>
      )}
      {level.lastEditedBy && (
        <p className="text-[10px] text-muted-foreground">
          Last edited by: {level.lastEditedBy}
          {level.lastEditedAt ? ` · ${level.lastEditedAt.slice(0, 10)}` : ""}
        </p>
      )}
    </div>
  )
}

export function ParamSummaryPanel({ requestId, routeLocked = false }: Props) {
  const { data, isLoading } = useParamSummary(requestId)
  const { hasPermission } = usePermissionContext()
  const canEdit = hasPermission("finance.costing.paramvalue.update")

  const [drawer, setDrawer] = useState<DrawerState | null>(null)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.products.length === 0) return null

  const allFilled = data.filledParams === data.totalParams && data.totalParams > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">Parameter Summary</CardTitle>
        <span
          className={`text-xs font-normal ${
            allFilled
              ? "text-green-600 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {data.filledParams} / {data.totalParams} filled
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion
          type="multiple"
          defaultValue={[]}
        >
          {data.products.map((product) => {
            const productFilled = product.levels.reduce((s, l) => s + l.filledParams, 0)
            const productTotal = product.levels.reduce((s, l) => s + l.totalParams, 0)
            return (
              <AccordionItem key={product.productSysId} value={String(product.productSysId)}>
                <AccordionTrigger className="py-2 text-xs hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-medium">{product.productCode}</span>
                    <span className="text-muted-foreground">
                      {productFilled}/{productTotal}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pb-2">
                  {product.levels.map((level) => (
                    <LevelSummary
                      key={level.routeLevel}
                      level={level}
                      canEdit={canEdit}
                      locked={routeLocked}
                      onEdit={() =>
                        setDrawer({
                          productSysId: product.productSysId,
                          productCode: product.productCode,
                          routeLevel: level.routeLevel,
                          params: level.params,
                        })
                      }
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>

      {drawer && (
        <OverrideParamsDrawer
          open
          onClose={() => setDrawer(null)}
          requestId={requestId}
          routeLevel={drawer.routeLevel}
          productSysId={drawer.productSysId}
          productCode={drawer.productCode}
          params={drawer.params}
        />
      )}
    </Card>
  )
}
