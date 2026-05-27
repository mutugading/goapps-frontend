"use client"

import { useMemo } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermissionContext } from "@/providers/permission-provider"
import { useDivisions } from "@/hooks/iam/use-division"
import { useDepartmentList } from "@/hooks/iam/use-departments"
import type { Section } from "@/types/iam/section"

interface Props {
    data: Section[]
    isLoading?: boolean
    onEdit: (entity: Section) => void
    onDelete: (entity: Section) => void
}

export function SectionTable({ data, isLoading, onEdit, onDelete }: Props) {
    const { hasPermission } = usePermissionContext()
    const canUpdate = hasPermission("iam.master.section.update")
    const canDelete = hasPermission("iam.master.section.delete")

    const { data: deptsPage } = useDepartmentList({ page: 1, pageSize: 200 })
    const { data: divisionsPage } = useDivisions({ page: 1, pageSize: 200 })

    const divisionLookup = useMemo(() => {
        const map = new Map<string, string>()
        for (const d of divisionsPage?.data ?? []) {
            if (d.divisionId) map.set(d.divisionId, d.divisionName || d.divisionCode || "—")
        }
        return map
    }, [divisionsPage])

    const departmentLookup = useMemo(() => {
        const map = new Map<string, { name: string; divisionId: string }>()
        for (const d of deptsPage?.data ?? []) {
            if (d.departmentId) map.set(d.departmentId, { name: d.departmentName || d.departmentCode || "—", divisionId: d.divisionId })
        }
        return map
    }, [deptsPage])

    const resolveDept = (row: Section): string =>
        row.department?.departmentName ||
        (row.departmentId ? departmentLookup.get(row.departmentId)?.name || "—" : "—")

    const resolveDivision = (row: Section): string => {
        if (row.department?.division?.divisionName) return row.department.division.divisionName
        const divisionId = row.departmentId ? departmentLookup.get(row.departmentId)?.divisionId : undefined
        return divisionId ? divisionLookup.get(divisionId) || "—" : "—"
    }

    const columns: ColumnDef<Section>[] = [
        { id: "code", header: "Code", width: "w-[140px]", cell: (row) => <span className="font-medium font-mono">{row.sectionCode || "-"}</span> },
        { id: "name", header: "Name", accessorKey: "sectionName" },
        { id: "department", header: "Department", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{resolveDept(row)}</span> },
        { id: "division", header: "Division", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{resolveDivision(row)}</span> },
        { id: "isActive", header: "Status", cell: (row) => <Badge variant={row.isActive ? "default" : "secondary"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    ]

    const actions: RowAction<Section>[] = []
    if (canUpdate) actions.push({ id: "edit", label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: onEdit })
    if (canDelete) actions.push({ id: "delete", label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, variant: "destructive" })

    return (
        <DataTable
            data={data}
            columns={columns}
            keyField="sectionId"
            actions={actions}
            isLoading={isLoading}
            emptyMessage="No sections found"
        />
    )
}
