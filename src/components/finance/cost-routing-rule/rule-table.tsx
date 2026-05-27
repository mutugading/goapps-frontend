"use client"

import { Edit, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CostRoutingRule } from "@/types/finance/cost-routing-rule"

interface Props {
  items: CostRoutingRule[]
  isLoading?: boolean
  onEdit: (r: CostRoutingRule) => void
  onDelete: (r: CostRoutingRule) => void
}

function shortJSON(s: string, max = 80): string {
  try {
    const compact = JSON.stringify(JSON.parse(s))
    return compact.length > max ? compact.slice(0, max) + "…" : compact
  } catch {
    return s.length > max ? s.slice(0, max) + "…" : s
  }
}

export function RuleTable({ items, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Priority</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="w-28">Action</TableHead>
            <TableHead className="w-44">Target</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}
          {!isLoading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No routing rules yet — all requests will land in the default triage queue.
              </TableCell>
            </TableRow>
          )}
          {items.map((r) => (
            <TableRow key={r.ruleId}>
              <TableCell className="font-mono">{r.priority}</TableCell>
              <TableCell className="font-mono text-xs">{shortJSON(r.condition)}</TableCell>
              <TableCell>
                <Badge variant={r.actionType === "AUTO_ASSIGN" ? "default" : "secondary"}>
                  {r.actionType}
                </Badge>
              </TableCell>
              <TableCell>{r.actionTarget || "—"}</TableCell>
              <TableCell>
                {r.isActive ? (
                  <Badge variant="secondary">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="icon" variant="ghost" onClick={() => onEdit(r)} title="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(r)} title="Delete">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
