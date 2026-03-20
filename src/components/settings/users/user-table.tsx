"use client"

import { Pencil, Trash2, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { UserWithDetail } from "@/types/iam/user"

interface UserTableProps {
    data: UserWithDetail[]
    isLoading?: boolean
    onEdit: (user: UserWithDetail) => void
    onDelete: (user: UserWithDetail) => void
    onManageRoles: (user: UserWithDetail) => void
}

export function UserTable({ data, isLoading, onEdit, onDelete, onManageRoles }: UserTableProps) {
    const columns: ColumnDef<UserWithDetail>[] = [
        {
            id: "employeeCode",
            header: "Employee ID",
            width: "w-[100px]",
            cell: (row) => (
                <span className="font-medium font-mono">{row.detail?.employeeCode || "-"}</span>
            ),
        },
        {
            id: "fullName",
            header: "Full Name",
            cell: (row) => (
                <div>
                    <div className="font-medium">{row.detail?.fullName || "-"}</div>
                    <div className="text-xs text-muted-foreground">{row.detail?.position || ""}</div>
                </div>
            ),
        },
        {
            id: "username",
            header: "Username",
            cell: (row) => (
                <span className="font-mono text-sm">{row.user?.username || "-"}</span>
            ),
        },
        {
            id: "email",
            header: "Email",
            hideOnMobile: true,
            cellClassName: "max-w-[200px] truncate text-muted-foreground",
            cell: (row) => row.user?.email || "-",
        },
        {
            id: "roles",
            header: "Roles",
            hideOnMobile: true,
            cell: (row) => (
                <div className="flex flex-wrap gap-1">
                    {(row.roleCodes || []).map((code) => (
                        <Badge key={code} variant="outline" className="text-xs">
                            {code}
                        </Badge>
                    ))}
                    {(!row.roleCodes || row.roleCodes.length === 0) && (
                        <span className="text-muted-foreground text-xs">No roles</span>
                    )}
                </div>
            ),
        },
        {
            id: "isActive",
            header: "Status",
            cell: (row) => (
                <Badge variant={row.user?.isActive ? "default" : "secondary"}>
                    {row.user?.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ]

    const actions: RowAction<UserWithDetail>[] = [
        {
            id: "edit",
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: onEdit,
        },
        {
            id: "roles",
            label: "Manage Roles",
            icon: <Shield className="h-4 w-4" />,
            onClick: onManageRoles,
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
            getRowKey={(row) => row.user?.userId || ''}
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No users found"
            emptyDescription="Try adjusting your search or filter criteria"
        />
    )
}
