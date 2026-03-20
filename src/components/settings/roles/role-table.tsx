"use client"

import { Pencil, Trash2, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { Role } from "@/types/iam/role"

interface RoleTableProps {
    data: Role[]
    isLoading?: boolean
    onEdit: (role: Role) => void
    onDelete: (role: Role) => void
    onManagePermissions: (role: Role) => void
}

export function RoleTable({ data, isLoading, onEdit, onDelete, onManagePermissions }: RoleTableProps) {
    const columns: ColumnDef<Role>[] = [
        {
            id: "roleCode",
            header: "Code",
            width: "w-[140px]",
            cell: (row) => (
                <span className="font-medium font-mono">{row.roleCode || "-"}</span>
            ),
        },
        {
            id: "roleName",
            header: "Name",
            accessorKey: "roleName",
        },
        {
            id: "description",
            header: "Description",
            hideOnMobile: true,
            cellClassName: "max-w-[250px] truncate text-muted-foreground",
            cell: (row) => row.description || "-",
        },
        {
            id: "userCount",
            header: "Users",
            width: "w-[80px]",
            cell: (row) => (
                <Badge variant="outline" className="font-mono">
                    {row.userCount}
                </Badge>
            ),
        },
        {
            id: "type",
            header: "Type",
            cell: (row) => (
                <Badge variant={row.isSystem ? "secondary" : "outline"}>
                    {row.isSystem ? "System" : "Custom"}
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

    const actions: RowAction<Role>[] = [
        {
            id: "permissions",
            label: "Manage Permissions",
            icon: <Shield className="h-4 w-4" />,
            onClick: onManagePermissions,
        },
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
            disabled: (row) => row.isSystem, // System roles cannot be deleted
        },
    ]

    return (
        <DataTable
            data={data}
            columns={columns}
            keyField="roleId"
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No roles found"
            emptyDescription="Try adjusting your search or filter criteria"
        />
    )
}
