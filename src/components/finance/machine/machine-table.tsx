"use client"

import { Pencil, Trash2 } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { StatusBadge } from "@/components/common"

import type { Machine } from "@/types/finance/machine"

interface MachineTableProps {
  data: Machine[]
  isLoading?: boolean
  onEdit: (machine: Machine) => void
  onDelete: (machine: Machine) => void
}

export function MachineTable({ data, isLoading, onEdit, onDelete }: MachineTableProps) {
  const columns: ColumnDef<Machine>[] = [
    {
      id: "machineCode",
      header: "Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.machineCode || "-"}</span>
      ),
    },
    {
      id: "machineName",
      header: "Name",
      accessorKey: "machineName",
    },
    {
      id: "mcType",
      header: "Type",
      width: "w-[100px]",
      cell: (row) => row.mcType || "-",
    },
    {
      id: "noOfPosition",
      header: "Positions",
      width: "w-[90px]",
      hideOnMobile: true,
      cell: (row) => row.noOfPosition ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "noOfEnd",
      header: "Ends",
      width: "w-[70px]",
      hideOnMobile: true,
      cell: (row) => row.noOfEnd ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "mpPerDay",
      header: "MP/Day",
      width: "w-[100px]",
      hideOnMobile: true,
      cell: (row) =>
        row.mpPerDay != null
          ? `$${row.mpPerDay.toFixed(2)}`
          : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "ohsPerDay",
      header: "OHS/Day",
      width: "w-[100px]",
      hideOnMobile: true,
      cell: (row) => row.ohsPerDay != null ? `$${row.ohsPerDay.toFixed(2)}` : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "sparesPerDay",
      header: "Spares/Day",
      width: "w-[100px]",
      hideOnMobile: true,
      cell: (row) => row.sparesPerDay != null ? `$${row.sparesPerDay.toFixed(2)}` : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "mcWeightage",
      header: "Weightage",
      width: "w-[90px]",
      hideOnMobile: true,
      cell: (row) => row.mcWeightage != null ? row.mcWeightage.toFixed(2) : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "mcPoyBobbinWeight",
      header: "Bobbin Wt (kg)",
      width: "w-[110px]",
      hideOnMobile: true,
      cell: (row) => row.mcPoyBobbinWeight != null ? row.mcPoyBobbinWeight.toFixed(2) : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "kgsLostChange",
      header: "CO Loss (kg)",
      width: "w-[110px]",
      hideOnMobile: true,
      cell: (row) =>
        row.kgsLostChange != null
          ? row.kgsLostChange.toFixed(3)
          : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "notes",
      header: "Notes",
      hideOnMobile: true,
      cellClassName: "max-w-[200px] truncate text-muted-foreground",
      cell: (row) => row.notes || "-",
    },
    {
      id: "isActive",
      header: "Status",
      width: "w-[100px]",
      cell: (row) => (
        <StatusBadge
          status={row.isActive ? "ACTIVE" : "INACTIVE"}
          type="product"
          size="sm"
        />
      ),
    },
  ]

  const actions: RowAction<Machine>[] = [
    {
      id: "edit",
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive",
    },
  ]

  return (
    <DataTable
      tableId="yarn-master-machines"
      data={data}
      columns={columns}
      keyField="machineId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No machines found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
