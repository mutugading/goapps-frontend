"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermissionContext } from "@/providers/permission-provider"
import type { CompanyMapping } from "@/types/iam/company-mapping"

interface Props {
    data: CompanyMapping[]
    isLoading?: boolean
    onEdit: (entity: CompanyMapping) => void
    onDelete: (entity: CompanyMapping) => void
}

export function CompanyMappingTable({ data, isLoading, onEdit, onDelete }: Props) {
    const { hasPermission } = usePermissionContext()
    const canUpdate = hasPermission("iam.master.companymapping.update")
    const canDelete = hasPermission("iam.master.companymapping.delete")

    const columns: ColumnDef<CompanyMapping>[] = [
        { id: "code", header: "Code", width: "w-[140px]", cell: (row) => <span className="font-medium font-mono">{row.code || "-"}</span> },
        { id: "name", header: "Name", accessorKey: "name" },
        {
            id: "path",
            header: "Org Path",
            cell: (row) => (
                <div className="text-xs text-muted-foreground">
                    {[row.companyName, row.divisionName, row.departmentName, row.sectionName].filter(Boolean).join(" › ") || "—"}
                </div>
            ),
        },
        { id: "isActive", header: "Status", cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    ]

    const actions: RowAction<CompanyMapping>[] = []
    if (canUpdate) actions.push({ id: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: onEdit })
    if (canDelete) actions.push({ id: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, variant: "destructive" })

    return (
        <DataTable
            data={data}
            columns={columns}
            keyField="companyMappingId"
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No company mappings found"
        />
    )
}
