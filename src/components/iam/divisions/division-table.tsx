"use client"

import { useMemo } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermissionContext } from "@/providers/permission-provider"
import { useCompanies } from "@/hooks/iam/use-company"
import type { Division } from "@/types/iam/division"

interface Props {
    data: Division[]
    isLoading?: boolean
    onEdit: (entity: Division) => void
    onDelete: (entity: Division) => void
}

export function DivisionTable({ data, isLoading, onEdit, onDelete }: Props) {
    const { hasPermission } = usePermissionContext()
    const canUpdate = hasPermission("iam.master.division.update")
    const canDelete = hasPermission("iam.master.division.delete")

    const { data: companiesPage } = useCompanies({ page: 1, pageSize: 200 })
    const companyLookup = useMemo(() => {
        const map = new Map<string, string>()
        for (const c of companiesPage?.data ?? []) {
            if (c.companyId) map.set(c.companyId, c.companyName || c.companyCode || "—")
        }
        return map
    }, [companiesPage])

    const resolveCompany = (row: Division): string =>
        row.company?.companyName ||
        (row.companyId ? companyLookup.get(row.companyId) || "—" : "—")

    const columns: ColumnDef<Division>[] = [
        { id: "code", header: "Code", width: "w-[140px]", cell: (row) => <span className="font-medium font-mono">{row.divisionCode || "-"}</span> },
        { id: "name", header: "Name", accessorKey: "divisionName" },
        { id: "company", header: "Company", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{resolveCompany(row)}</span> },
        { id: "isActive", header: "Status", cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    ]

    const actions: RowAction<Division>[] = []
    if (canUpdate) actions.push({ id: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: onEdit })
    if (canDelete) actions.push({ id: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, variant: "destructive" })

    return (
        <DataTable
            data={data}
            columns={columns}
            keyField="divisionId"
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No divisions found"
        />
    )
}
