"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { CMSSection } from "@/types/iam/cms-section"
import { SECTION_TYPE_LABELS } from "@/types/iam/cms-section"

interface CMSSectionTableProps {
  data: CMSSection[]
  isLoading?: boolean
  onEdit: (section: CMSSection) => void
  onDelete: (section: CMSSection) => void
}

export function CMSSectionTable({ data, isLoading, onEdit, onDelete }: CMSSectionTableProps) {
  const columns: ColumnDef<CMSSection>[] = [
    {
      id: "sectionKey",
      header: "Key",
      width: "w-[180px]",
      cell: (row) => (
        <span className="font-medium font-mono text-sm">{row.sectionKey || "-"}</span>
      ),
    },
    {
      id: "sectionType",
      header: "Type",
      width: "w-[100px]",
      cell: (row) => (
        <Badge variant="outline">
          {SECTION_TYPE_LABELS[row.sectionType] || "Unknown"}
        </Badge>
      ),
    },
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
    },
    {
      id: "sortOrder",
      header: "Order",
      width: "w-[70px]",
      hideOnMobile: true,
      cell: (row) => row.sortOrder,
    },
    {
      id: "isPublished",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isPublished ? "default" : "secondary"}>
          {row.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
  ]

  const actions: RowAction<CMSSection>[] = [
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
      data={data}
      columns={columns}
      keyField="sectionId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No CMS sections found"
      emptyDescription="Create a new section to get started"
    />
  )
}
