"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ChartProps } from "@/components/bi/chart-engine/types"
import { toRechartsRows, seriesNames, cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { cn } from "@/lib/utils"

export default function BiDataTable({ config, data, onDrill, height = 360 }: ChartProps) {
  const rows = toRechartsRows(data)
  const names = seriesNames(data)
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  // Use drillContext.currentPath so multi-level drill paths are preserved correctly.
  const currentPath = data.drillContext?.currentPath ?? []
  const canDrill = Boolean(data.drillContext?.canDrill) && Boolean(onDrill)

  return (
    <div className="overflow-auto" style={{ maxHeight: height }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            {names.map((n) => (
              <TableHead key={n} className="text-right">
                {n}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow
              key={i}
              className={cn(canDrill ? "cursor-pointer hover:bg-muted/50" : "")}
              onClick={canDrill ? () => onDrill?.([...currentPath, String(r.category)]) : undefined}
            >
              <TableCell className="font-medium">{r.category}</TableCell>
              {names.map((n) => (
                <TableCell key={n} className="text-right tabular-nums">
                  {typeof r[n] === "number" ? formatNumber(r[n] as number, fmt, decimals) : "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
