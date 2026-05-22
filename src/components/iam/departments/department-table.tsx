"use client"

import { useMemo } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermissionContext } from "@/providers/permission-provider"
import { useCompanies } from "@/hooks/iam/use-company"
import { useDivisions } from "@/hooks/iam/use-division"
import type { Department } from "@/types/iam/department"

interface Props {
    data: Department[]
    isLoading?: boolean
    onEdit: (entity: Department) => void
    onDelete: (entity: Department) => void
}

export function DepartmentTable({ data, isLoading, onEdit, onDelete }: Props) {
    const { hasPermission } = usePermissionContext()
    const canUpdate = hasPermission("iam.master.department.update")
    const canDelete = hasPermission("iam.master.department.delete")

    const { data: companiesPage } = useCompanies({ page: 1, pageSize: 200 })
    const { data: divisionsPage } = useDivisions({ page: 1, pageSize: 200 })

    const companyLookup = useMemo(() => {
        const map = new Map<string, string>()
        for (const c of companiesPage?.data ?? []) {
            if (c.companyId) map.set(c.companyId, c.companyName || c.companyCode || "—")
        }
        return map
    }, [companiesPage])

    // Map divisionId -> { name, companyId }
    const divisionLookup = useMemo(() => {
        const map = new Map<string, { name: string; companyId: string }>()
        for (const d of divisionsPage?.data ?? []) {
            if (d.divisionId) map.set(d.divisionId, { name: d.divisionName || d.divisionCode || "—", companyId: d.companyId })
        }
        return map
    }, [divisionsPage])

    const resolveDivision = (row: Department): string =>
        row.division?.divisionName ||
        (row.divisionId ? divisionLookup.get(row.divisionId)?.name || "—" : "—")

    const resolveCompany = (row: Department): string => {
        if (row.division?.company?.companyName) return row.division.company.companyName
        const companyId = row.divisionId ? divisionLookup.get(row.divisionId)?.companyId : undefined
        return companyId ? companyLookup.get(companyId) || "—" : "—"
    }

    const columns: ColumnDef<Department>[] = [
        { id: "code", header: "Code", width: "w-[140px]", cell: (row) => <span className="font-medium font-mono">{row.departmentCode || "-"}</span> },
        { id: "name", header: "Name", accessorKey: "departmentName" },
        { id: "division", header: "Division", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{resolveDivision(row)}</span> },
        { id: "company", header: "Company", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{resolveCompany(row)}</span> },
        { id: "isActive", header: "Status", cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    ]

    const actions: RowAction<Department>[] = []
    if (canUpdate) actions.push({ id: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: onEdit })
    if (canDelete) actions.push({ id: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, variant: "destructive" })

    return (
        <DataTable
            data={data}
            columns={columns}
            keyField="departmentId"
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No departments found"
        />
    )
}
