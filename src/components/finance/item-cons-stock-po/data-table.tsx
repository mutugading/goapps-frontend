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
    { id: "consQty",    header: "Cons Qty",    width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.consQty) },
    { id: "consVal",    header: "Cons Value",  width: "w-[110px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.consVal) },
    { id: "consRate",   header: "Cons Rate",   width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.consRate) },
    { id: "storesQty",  header: "Stores Qty",  width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.storesQty) },
    { id: "storesVal",  header: "Stores Val",  width: "w-[110px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.storesVal) },
    { id: "storesRate", header: "Stores Rate", width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.storesRate) },
    { id: "deptQty",    header: "Dept Qty",    width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.deptQty) },
    { id: "deptVal",    header: "Dept Val",    width: "w-[110px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.deptVal) },
    { id: "deptRate",   header: "Dept Rate",   width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.deptRate) },
    { id: "po1Qty",     header: "PO 1 Qty",    width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoQty1) },
    { id: "po1Val",     header: "PO 1 Val",    width: "w-[110px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoVal1) },
    { id: "po1Rate",    header: "PO 1 Rate",   width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoRate1) },
    { id: "po2Qty",     header: "PO 2 Qty",    width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoQty2) },
    { id: "po2Val",     header: "PO 2 Val",    width: "w-[110px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoVal2) },
    { id: "po2Rate",    header: "PO 2 Rate",   width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoRate2) },
    { id: "po3Qty",     header: "PO 3 Qty",    width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoQty3) },
    { id: "po3Val",     header: "PO 3 Val",    width: "w-[110px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoVal3) },
    { id: "po3Rate",    header: "PO 3 Rate",   width: "w-[100px]", hideOnMobile: true, cellClassName: "text-right", cell: (row) => formatNumber(row.lastPoRate3) },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowKey={(row, index) => `${row.period}-${row.itemCode}-${row.gradeCode}-${index}`}
      isLoading={isLoading}
      emptyMessage="No data found"
      emptyDescription="Sync Oracle data to see item consumption records"
    />
  )
}
