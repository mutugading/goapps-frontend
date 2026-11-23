"use client"

import { DataTable, DataTablePagination, type ColumnDef } from "@/components/shared"
import type { RunLine } from "@/types/generated/payroll/v1/run"

import { formatNominal } from "./payroll-format"

interface RunLinesTableProps {
  data: RunLine[]
  isLoading?: boolean
  pagination?: { currentPage: number; pageSize: number; totalItems: number; totalPages: number }
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function RunLinesTable({ data, isLoading, pagination, onPageChange, onPageSizeChange }: RunLinesTableProps) {
  const columns: ColumnDef<RunLine>[] = [
    { id: "nik", header: "NIK", cellClassName: "font-mono", accessorKey: "nik" },
    { id: "compType", header: "Type", width: "w-[70px]", cell: (row) => (row.compType === "T" ? "Earning" : row.compType === "P" ? "Deduction" : row.compType) },
    { id: "compId", header: "Comp", width: "w-[70px]", cellClassName: "font-mono", cell: (row) => row.compId },
    { id: "description", header: "Component", cell: (row) => row.description || "-" },
    { id: "base", header: "Base", headerClassName: "text-right", cellClassName: "text-right font-mono", hideOnMobile: true, cell: (row) => formatNominal(row.base) },
    { id: "qty", header: "Qty", headerClassName: "text-right", cellClassName: "text-right font-mono", hideOnMobile: true, cell: (row) => row.qty || "-" },
    { id: "rate", header: "Rate", headerClassName: "text-right", cellClassName: "text-right font-mono", hideOnMobile: true, cell: (row) => formatNominal(row.rate) },
    { id: "amount", header: "Amount", headerClassName: "text-right", cellClassName: "text-right font-mono font-medium", cell: (row) => formatNominal(row.amount) },
    { id: "formula", header: "Formula", hideOnMobile: true, cellClassName: "max-w-[220px] truncate text-muted-foreground", cell: (row) => row.formula || "-" },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(row, i) => `${row.nik}-${row.compType}-${row.compId}-${i}`}
        isLoading={isLoading}
        emptyMessage="No run lines found"
        emptyDescription="Try another NIK"
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
