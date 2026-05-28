"use client"

// BI Upload — recent uploads history table.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/common/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUploadHistory } from "@/hooks/bi/use-upload"

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString()
}

export function UploadHistory() {
  const { data, isLoading } = useUploadHistory(1, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Uploads</CardTitle>
        <CardDescription>The last 10 upload attempts.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No uploads yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((u) => (
                  <TableRow key={`${u.fileName}-${u.uploadedAt}`}>
                    <TableCell className="max-w-48 truncate font-medium" title={u.fileName}>
                      {u.fileName || "—"}
                    </TableCell>
                    <TableCell>{u.targetType || "—"}</TableCell>
                    <TableCell className="text-right">
                      {u.committedRows > 0 ? u.committedRows : u.validRows}/{u.totalRows}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.uploadedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
