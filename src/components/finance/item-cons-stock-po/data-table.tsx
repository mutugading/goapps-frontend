"use client"

import { DataTable, type ColumnDef } from "@/components/shared"
import type { ItemConsStockPO } from "@/types/finance/oracle-sync"

interface DataTableProps {
  data: ItemConsStockPO[]
  isLoading?: boolean
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === 0) return "-"
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ItemConsStockPOTable({ data, isLoading }: DataTableProps) {
  const columns: ColumnDef<ItemConsStockPO>[] = [
    {
      id: "itemCode",
      header: "Item Code",
      width: "w-[120px]",
      cell: (row) => (
        <span className="font-mono text-sm font-medium">{row.itemCode || "-"}</span>
      ),
    },
    {
      id: "itemName",
      header: "Item Name",
      cell: (row) => row.itemName || "-",
    },
    {
      id: "gradeCode",
      header: "Grade",
      width: "w-[80px]",
      cell: (row) => row.gradeCode || "-",
    },
    {
      id: "uom",
      header: "UOM",
      width: "w-[60px]",
      cell: (row) => row.uom || "-",
    },
    {
      id: "consQty",
      header: "Cons Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right",
      cell: (row) => formatNumber(row.consQty),
    },
    {
      id: "consVal",
      header: "Cons Value",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right",
      cell: (row) => formatNumber(row.consVal),
    },
    {
      id: "storesQty",
      header: "Stores Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right",
      cell: (row) => formatNumber(row.storesQty),
    },
    {
      id: "storesVal",
      header: "Stores Value",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right",
      cell: (row) => formatNumber(row.storesVal),
    },
    {
      id: "deptQty",
      header: "Dept Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right",
      cell: (row) => formatNumber(row.deptQty),
    },
    {
      id: "lastPoRate1",
      header: "Last PO Rate",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right",
      cell: (row) => formatNumber(row.lastPoRate1),
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      keyField="itemCode"
      isLoading={isLoading}
      emptyMessage="No data found"
      emptyDescription="Sync Oracle data to see item consumption records"
    />
  )
}
