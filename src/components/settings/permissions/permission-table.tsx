"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { PermissionDetail } from "@/types/iam/role"

interface PermissionTableProps {
    data: PermissionDetail[]
    isLoading?: boolean
    onEdit: (permission: PermissionDetail) => void
    onDelete: (permission: PermissionDetail) => void
}

export function PermissionTable({ data, isLoading, onEdit, onDelete }: PermissionTableProps) {
    const columns: ColumnDef<PermissionDetail>[] = [
        {
            id: "permissionCode",
            header: "Code",
            width: "w-[280px]",
            cell: (row) => (
                <span className="font-medium font-mono text-xs">{row.permissionCode || "-"}</span>
            ),
        },
        {
            id: "permissionName",
            header: "Name",
            accessorKey: "permissionName",
        },
        {
            id: "serviceName",
            header: "Service",
            hideOnMobile: true,
            cell: (row) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {row.serviceName}
                </Badge>
            ),
        },
        {
            id: "moduleName",
            header: "Module",
            hideOnMobile: true,
            cell: (row) => (
                <span className="text-muted-foreground">{row.moduleName}</span>
            ),
        },
        {
            id: "actionType",
            header: "Action",
            cell: (row) => {
                const variant = row.actionType === "delete" ? "destructive"
                    : row.actionType === "create" ? "default"
                    : "secondary"
                return (
                    <Badge variant={variant} className="text-xs">
                        {row.actionType}
                    </Badge>
                )
            },
        },
        {
            id: "roleCount",
            header: "Roles",
            width: "w-[70px]",
            cell: (row) => (
                <Badge variant="outline" className="font-mono">
                    {row.roleCount}
                </Badge>
            ),
        },
        {
            id: "isActive",
            header: "Status",
            cell: (row) => (
                <Badge variant={row.isActive ? "default" : "secondary"}>
                    {row.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ]

    const actions: RowAction<PermissionDetail>[] = [
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
            keyField="permissionId"
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No permissions found"
            emptyDescription="Try adjusting your search or filter criteria"
        />
    )
}
