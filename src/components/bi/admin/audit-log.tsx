"use client"

// Audit Log tab — BI dashboard/group config-change history.
// Records every CREATE/UPDATE/DELETE against a dashboard or dashboard group.

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserName } from "@/components/common/user-name"
import { useConfigAudit } from "@/hooks/bi/use-audit"
import type { NormalizedAuditEntry } from "@/types/bi"

const PAGE_SIZE = 20

const ENTITY_OPTIONS = [
  { value: "all", label: "All Entities" },
  { value: "dashboard", label: "Dashboard" },
  { value: "group", label: "Group" },
] as const

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
}

const ACTION_CLASS: Record<string, string> = {
  CREATE: "bg-emerald-600 hover:bg-emerald-600 text-white",
  UPDATE: "bg-blue-600 hover:bg-blue-600 text-white",
  DELETE: "",
}

const ENTITY_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  group: "Group",
}

function formatWhen(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function entityLabel(entry: NormalizedAuditEntry): string {
  const kind = ENTITY_LABEL[entry.entityType] ?? entry.entityType ?? "—"
  const name = entry.entityTitle || entry.entityCode
  return name ? `${kind}: ${name}` : kind
}

export function AuditLog() {
  const [entityType, setEntityType] = useState<string>("all")
  const [page, setPage] = useState(1)

  const filterValue = entityType === "all" ? "" : entityType
  const { data, isLoading, isError } = useConfigAudit({ page, pageSize: PAGE_SIZE, entityType: filterValue })

  const entries = data?.entries ?? []
  const totalPages = data?.totalPages ?? 0

  const handleEntityChange = (value: string) => {
    setEntityType(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={entityType} onValueChange={handleEntityChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter entity" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">When</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead className="w-28">Action</TableHead>
              <TableHead className="w-56">Changed By</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-destructive">
                  Failed to load audit log
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No configuration changes recorded yet
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.auditId}>
                  <TableCell className="text-sm text-muted-foreground">{formatWhen(entry.changedAt)}</TableCell>
                  <TableCell className="font-medium">{entityLabel(entry)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ACTION_VARIANT[entry.action] ?? "outline"}
                      className={ACTION_CLASS[entry.action] ?? ""}
                    >
                      {entry.action || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate text-sm text-muted-foreground">
                    <UserName userId={entry.changedBy} compact />
                  </TableCell>
                  <TableCell className="text-sm">{entry.summary || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
