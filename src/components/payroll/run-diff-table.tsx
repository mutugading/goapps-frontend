"use client"

import { DataTable, DataTablePagination, type ColumnDef } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import type { RunDiffLine } from "@/types/generated/payroll/v1/run"

import { formatNominal } from "./payroll-format"

interface RunDiffTableProps {
  data: RunDiffLine[]
  isLoading?: boolean
  pagination?: { currentPage: number; pageSize: number; totalItems: number; totalPages: number }
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const money = "text-right font-mono"

export function RunDiffTable({ data, isLoading, pagination, onPageChange, onPageSizeChange }: RunDiffTableProps) {
  const columns: ColumnDef<RunDiffLine>[] = [
    { id: "nik", header: "NIK", cellClassName: "font-mono", accessorKey: "nik" },
    { id: "component", header: "Component", width: "w-[100px]", cellClassName: "font-mono", cell: (row) => row.component },
    { id: "legacy", header: "Against", headerClassName: "text-right", cellClassName: money, cell: (row) => formatNominal(row.legacyAmount) },
    { id: "target", header: "Run", headerClassName: "text-right", cellClassName: money, cell: (row) => formatNominal(row.targetAmount) },
    { id: "delta", header: "Delta", headerClassName: "text-right", cellClassName: `${money} font-medium`, cell: (row) => formatNominal(row.deltaAmount) },
    { id: "category", header: "Category", cell: (row) => <Badge variant="outline">{row.category}</Badge> },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(row, i) => `${row.nik}-${row.component}-${i}`}
        isLoading={isLoading}
        emptyMessage="No differing lines"
        emptyDescription="All lines match, or try another NIK / category"
      />
      {pagination && pagination.totalItems > 0 && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
