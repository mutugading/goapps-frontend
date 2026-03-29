"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { CMSPage } from "@/types/iam/cms-page"

interface CMSPageTableProps {
  data: CMSPage[]
  isLoading?: boolean
  onEdit: (page: CMSPage) => void
  onDelete: (page: CMSPage) => void
}

export function CMSPageTable({ data, isLoading, onEdit, onDelete }: CMSPageTableProps) {
  const columns: ColumnDef<CMSPage>[] = [
    {
      id: "pageSlug",
      header: "Slug",
      width: "w-[150px]",
      cell: (row) => (
        <span className="font-medium font-mono text-sm">{row.pageSlug || "-"}</span>
      ),
    },
    {
      id: "pageTitle",
      header: "Title",
      accessorKey: "pageTitle",
    },
    {
      id: "metaDescription",
      header: "Description",
      hideOnMobile: true,
      cellClassName: "max-w-[200px] truncate text-muted-foreground",
      cell: (row) => row.metaDescription || "-",
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

  const actions: RowAction<CMSPage>[] = [
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
      keyField="pageId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No CMS pages found"
      emptyDescription="Create a new page to get started"
    />
  )
}
