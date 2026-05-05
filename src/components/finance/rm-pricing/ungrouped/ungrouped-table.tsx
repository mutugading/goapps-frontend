"use client"

import { Plus } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { GroupingScope, UngroupedItem } from "@/types/finance/rm-group"

interface UngroupedTableProps {
  data: UngroupedItem[]
  isLoading?: boolean
  scope: GroupingScope
  onAddToGroup?: (item: UngroupedItem) => void
}

function formatAssignedAt(value: string | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function UngroupedTable({ data, isLoading, scope, onAddToGroup }: UngroupedTableProps) {
  const baseColumns: ColumnDef<UngroupedItem>[] = [
    {
      id: "itemCode",
      header: "Item Code",
      width: "w-[140px]",
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
      header: "Grade Code",
      width: "w-[100px]",
      cell: (row) => (
        <span className="text-sm font-mono">{row.gradeCode || "—"}</span>
      ),
    },
    {
      id: "itemGrade",
      header: "Grade Name",
      width: "w-[180px]",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.itemGrade || "—"}</span>
      ),
    },
    {
      id: "uomCode",
      header: "UOM",
      width: "w-[80px]",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.uomCode || "—"}</span>
      ),
    },
  ]

  const groupedColumns: ColumnDef<UngroupedItem>[] = [
    {
      id: "groupCode",
      header: "Group Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono text-sm">{row.groupCode || "—"}</span>
      ),
    },
    {
      id: "groupName",
      header: "Group Name",
      cell: (row) => <span className="text-sm">{row.groupName || "—"}</span>,
    },
    {
      id: "sortOrder",
      header: "Sort",
      width: "w-[70px]",
      hideOnMobile: true,
      cellClassName: "text-right font-mono",
      cell: (row) => row.sortOrder ?? "—",
    },
    {
      id: "assignedAt",
      header: "Assigned",
      width: "w-[120px]",
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatAssignedAt(row.assignedAt)}
        </span>
      ),
    },
  ]

  const columns: ColumnDef<UngroupedItem>[] =
    scope === "grouped" ? [...baseColumns, ...groupedColumns] : baseColumns

  const actions: RowAction<UngroupedItem>[] =
    scope === "ungrouped" && onAddToGroup
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
        `${row.itemCode}::${row.gradeCode || ""}::${index}`
      }
      actions={actions}
      isLoading={isLoading}
      emptyMessage={
        scope === "grouped" ? "No grouped items match the filter" : "All items are grouped"
      }
      emptyDescription={
        scope === "grouped"
          ? "No (item_code, grade_code) pairs are currently assigned to an active group"
          : "Every (item_code, grade_code) pair from the sync feed is assigned to a group"
      }
    />
  )
}
