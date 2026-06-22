"use client"

import { useState } from "react"
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { format, parseISO } from "date-fns"

import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DataTablePagination } from "@/components/shared"
import { useImportJobs } from "@/hooks/finance/use-cost-import"
import { IMPORT_ENTITY_LABELS } from "@/types/finance/cost-import"
import type { CostImportJob, ImportJobStatus } from "@/types/finance/cost-import"

const ALL = "all"

const STATUS_OPTIONS = [
  { value: ALL, label: "Semua Status" },
  { value: "PENDING", label: "Pending" },
  { value: "RUNNING", label: "Running" },
  { value: "DONE", label: "Done" },
  { value: "PARTIAL", label: "Partial" },
  { value: "FAILED", label: "Failed" },
]

const ENTITY_OPTIONS = [
  { value: ALL, label: "Semua Tipe" },
  { value: "product_master", label: "Product Master" },
  { value: "capp", label: "Cost Applicable Parameters" },
  { value: "cpp", label: "Cost Product Parameters" },
  { value: "bulk_product_routing", label: "Bulk Import (Product + Routing)" },
  { value: "bulk_product_routing_export", label: "Bulk Export (Product + Routing)" },
]

function StatusIcon({ status }: { status: ImportJobStatus }) {
  switch (status) {
    case "DONE":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "FAILED":
      return <XCircle className="h-4 w-4 text-destructive" />
    case "PARTIAL":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case "RUNNING":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function StatusBadgeJob({ status }: { status: ImportJobStatus }) {
  const variants: Record<ImportJobStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    PENDING: { variant: "secondary", label: "Pending" },
    RUNNING: { variant: "default", label: "Running" },
    DONE: { variant: "default", label: "Done" },
    PARTIAL: { variant: "outline", label: "Partial" },
    FAILED: { variant: "destructive", label: "Failed" },
  }
  const { variant, label } = variants[status] ?? { variant: "secondary", label: status }
  const colorClass =
    status === "DONE"
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400"
      : status === "PARTIAL"
        ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
        : status === "RUNNING"
          ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
          : ""
  return (
    <Badge variant={variant} className={`text-xs ${colorClass}`}>
      {label}
    </Badge>
  )
}

function JobRow({ job }: { job: CostImportJob }) {
  const isExport = job.entity === "bulk_product_routing_export"
  const progressPct =
    job.totalRows > 0 ? Math.round((job.processed / job.totalRows) * 100) : 0
  const isActive = job.status === "PENDING" || job.status === "RUNNING"

  const downloadUrl = job.errorFileUrl
  const downloadLabel = isExport ? "Download" : "Error Report"

  function fmtDate(iso: string) {
    if (!iso) return "—"
    try {
      return format(parseISO(iso), "dd MMM yyyy HH:mm")
    } catch {
      return iso
    }
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">
        #{job.jobId}
      </TableCell>
      <TableCell>
        <span className="text-xs">
          {IMPORT_ENTITY_LABELS[job.entity] ?? job.entity}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <StatusIcon status={job.status} />
          <StatusBadgeJob status={job.status} />
        </div>
      </TableCell>
      <TableCell>
        {job.totalRows > 0 ? (
          <div className="space-y-1 min-w-[100px]">
            <Progress value={progressPct} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {isActive
                ? `${job.processed}/${job.totalRows}`
                : isExport
                  ? `${job.success} produk`
                  : `${job.success} ok · ${job.failed} gagal · ${job.skipped} skip`}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {fmtDate(job.createdAt)}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {fmtDate(job.completedAt)}
      </TableCell>
      <TableCell>
        {downloadUrl ? (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
            <a href={downloadUrl} download>
              <Download className="h-3.5 w-3.5" />
              {downloadLabel}
            </a>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}

export function ImportJobsPageClient() {
  const [entityFilter, setEntityFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, refetch, isFetching } = useImportJobs(
    {
      entity: entityFilter === ALL ? "" : entityFilter,
      status: statusFilter === ALL ? "" : statusFilter,
      page,
      pageSize,
    },
    5000,
  )

  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import / Export Jobs"
        subtitle="Status dan riwayat semua job import dan export asinkon."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Job ID</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[200px]">Progress</TableHead>
              <TableHead className="w-[150px]">Dibuat</TableHead>
              <TableHead className="w-[150px]">Selesai</TableHead>
              <TableHead className="w-[130px]">File</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12">
                  <EmptyState
                    title="Belum ada job"
                    description="Job import atau export akan muncul di sini setelah dijadwalkan."
                    icon={FileSpreadsheet}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((job) => <JobRow key={job.jobId} job={job} />)
            )}
          </TableBody>
        </Table>
      </div>

      {(data?.totalItems ?? 0) > pageSize && (
        <DataTablePagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={data?.totalItems ?? 0}
          totalPages={data?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      )}
    </div>
  )
}
