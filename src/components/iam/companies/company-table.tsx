"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermissionContext } from "@/providers/permission-provider"

import type { Company } from "@/types/iam/company"

interface CompanyTableProps {
    data: Company[]
    isLoading?: boolean
    onEdit: (entity: Company) => void
    onDelete: (entity: Company) => void
}

export function CompanyTable({ data, isLoading, onEdit, onDelete }: CompanyTableProps) {
    const { hasPermission } = usePermissionContext()
    const canUpdate = hasPermission("iam.master.company.update")
    const canDelete = hasPermission("iam.master.company.delete")

    const columns: ColumnDef<Company>[] = [
        {
            id: "code",
            header: "Code",
            width: "w-[140px]",
            cell: (row) => <span className="font-medium font-mono">{row.companyCode || "-"}</span>,
        },
        { id: "name", header: "Name", accessorKey: "companyName" },
        { id: "description", header: "Description", hideOnMobile: true, cellClassName: "text-muted-foreground", accessorKey: "description" },
        {
            id: "isActive",
            header: "Status",
            cell: (row) => (
                <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge>
            ),
        },
    ]

    const actions: RowAction<Company>[] = []
    if (canUpdate) actions.push({ id: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: onEdit })
    if (canDelete) actions.push({ id: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, variant: "destructive" })

    return (
        <DataTable
            data={data}
            columns={columns}
            keyField="companyId"
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No companies found"
            emptyDescription="Try adjusting your filters"
        />
    )
}
