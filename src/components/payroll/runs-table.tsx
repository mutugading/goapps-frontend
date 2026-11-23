"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef } from "@/components/shared"
import type { Run } from "@/types/generated/payroll/v1/run"

import { formatNominal, formatYymm, runStatusVariant } from "./payroll-format"

interface RunsTableProps {
  data: Run[]
  isLoading?: boolean
}

export function RunsTable({ data, isLoading }: RunsTableProps) {
  const columns: ColumnDef<Run>[] = [
    {
      id: "runId",
      header: "Run",
      width: "w-[90px]",
      cell: (row) => (
        <Link href={`/hr/payroll/runs/${row.runId}`} className="font-mono font-medium text-primary hover:underline">
          #{row.runId}
        </Link>
      ),
    },
    { id: "yymm", header: "Period", cell: (row) => formatYymm(row.yymm) },
    { id: "division", header: "Division", accessorKey: "division" },
    {
      id: "status",
      header: "Status",
      cell: (row) => <Badge variant={runStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      id: "employeeCount",
      header: "Employees",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => row.employeeCount,
    },
    {
      id: "totalTunjangan",
      header: "Total Earnings",
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      hideOnMobile: true,
      cell: (row) => formatNominal(row.totalTunjangan),
    },
    {
      id: "totalPotongan",
      header: "Total Deductions",
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      hideOnMobile: true,
      cell: (row) => formatNominal(row.totalPotongan),
    },
    {
      id: "startedAt",
      header: "Started",
      hideOnMobile: true,
      cellClassName: "text-muted-foreground",
      cell: (row) => (row.startedAt ? row.startedAt.replace("T", " ").slice(0, 16) : "-"),
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowKey={(row) => String(row.runId)}
      isLoading={isLoading}
      emptyMessage="No payroll runs found"
      emptyDescription="Runs are created from the CLI; adjust the filters to see history"
    />
  )
}
