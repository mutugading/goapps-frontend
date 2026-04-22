"use client"

import { Plus } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { UngroupedItem } from "@/types/finance/rm-group"

interface UngroupedTableProps {
  data: UngroupedItem[]
  isLoading?: boolean
  onAddToGroup?: (item: UngroupedItem) => void
}

function fmt(value: number | undefined): string {
  if (!value || value === 0) return "—"
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function UngroupedTable({ data, isLoading, onAddToGroup }: UngroupedTableProps) {
  const columns: ColumnDef<UngroupedItem>[] = [
    {
      id: "itemCode",
      header: "Item Code",
      width: "w-[120px]",
      cell: (row) => (
        <span className="font-medium font-mono text-sm">{row.itemCode || "—"}</span>
      ),
    },
    {
      id: "itemName",
      header: "Item Name",
      cell: (row) => <span className="text-sm">{row.itemName || "—"}</span>,
    },
    {
      id: "gradeCode",
      header: "Grade",
      width: "w-[80px]",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.gradeCode || "—"}</span>
      ),
    },
    {
      id: "uomCode",
      header: "UOM",
      width: "w-[60px]",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.uomCode || "—"}</span>
      ),
    },
    {
      id: "consQty",
      header: "Cons Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.consQty),
    },
    {
      id: "consVal",
      header: "Cons Value",
      width: "w-[110px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.consVal),
    },
    {
      id: "consRate",
      header: "Cons Rate",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.consRate),
    },
    {
      id: "storesQty",
      header: "Stores Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.storesQty),
    },
    {
      id: "storesVal",
      header: "Stores Value",
      width: "w-[110px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.storesVal),
    },
    {
      id: "storesRate",
      header: "Stores Rate",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.storesRate),
    },
    {
      id: "deptQty",
      header: "Dept Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.deptQty),
    },
    {
      id: "deptVal",
      header: "Dept Value",
      width: "w-[110px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.deptVal),
    },
    {
      id: "deptRate",
      header: "Dept Rate",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.deptRate),
    },
    {
      id: "lastPoQty1",
      header: "PO1 Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoQty1),
    },
    {
      id: "lastPoVal1",
      header: "PO1 Value",
      width: "w-[110px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoVal1),
    },
    {
      id: "lastPoRate1",
      header: "PO1 Rate",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoRate1),
    },
    {
      id: "lastPoQty2",
      header: "PO2 Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoQty2),
    },
    {
      id: "lastPoVal2",
      header: "PO2 Value",
      width: "w-[110px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoVal2),
    },
    {
      id: "lastPoRate2",
      header: "PO2 Rate",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoRate2),
    },
    {
      id: "lastPoQty3",
      header: "PO3 Qty",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoQty3),
    },
    {
      id: "lastPoVal3",
      header: "PO3 Value",
      width: "w-[110px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoVal3),
    },
    {
      id: "lastPoRate3",
      header: "PO3 Rate",
      width: "w-[100px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => fmt(row.lastPoRate3),
    },
  ]

  const actions: RowAction<UngroupedItem>[] = onAddToGroup
    ? [
        {
          id: "addToGroup",
          label: "Add to Group",
          icon: <Plus className="h-4 w-4" />,
          onClick: onAddToGroup,
        },
      ]
    : []

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowKey={(row, index) =>
        `${row.period || ""}::${row.itemCode}::${row.gradeCode || ""}::${index}`
      }
      actions={actions}
      isLoading={isLoading}
      emptyMessage="All items are grouped"
      emptyDescription="No ungrouped items for this period"
    />
  )
}
