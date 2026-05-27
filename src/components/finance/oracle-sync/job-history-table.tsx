"use client"

import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import {
  type SyncJob,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANTS,
  formatPeriod,
} from "@/types/finance/oracle-sync"

interface JobHistoryTableProps {
  data: SyncJob[]
  isLoading?: boolean
  onViewDetail: (job: SyncJob) => void
}

export function JobHistoryTable({ data, isLoading, onViewDetail }: JobHistoryTableProps) {
  const columns: ColumnDef<SyncJob>[] = [
    {
      id: "jobCode",
      header: "Job Code",
      width: "w-[200px]",
      cell: (row) => (
        <span className="font-medium font-mono text-sm">{row.jobCode || "-"}</span>
      ),
    },
    {
      id: "period",
      header: "Period",
      width: "w-[100px]",
      cell: (row) => formatPeriod(row.period),
    },
    {
      id: "status",
      header: "Status",
      width: "w-[120px]",
      cell: (row) => (
        <Badge variant={JOB_STATUS_VARIANTS[row.status]}>
          {JOB_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      width: "w-[80px]",
      cell: (row) => <span>{row.progress}%</span>,
    },
    {
      id: "createdBy",
      header: "Triggered By",
      hideOnMobile: true,
      cell: (row) => row.createdBy || "-",
    },
    {
      id: "queuedAt",
      header: "Queued At",
      hideOnMobile: true,
      cell: (row) => row.queuedAt
        ? new Date(row.queuedAt).toLocaleString()
        : "-",
    },
    {
      id: "completedAt",
      header: "Completed At",
      hideOnMobile: true,
      cell: (row) => row.completedAt
        ? new Date(row.completedAt).toLocaleString()
        : "-",
    },
  ]

  const actions: RowAction<SyncJob>[] = [
    {
      id: "view",
      label: "View Detail",
      icon: <Eye className="h-4 w-4" />,
      onClick: onViewDetail,
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      keyField="jobId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No sync jobs found"
      emptyDescription="Trigger a sync to see job history"
    />
  )
}
