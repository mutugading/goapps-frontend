"use client"

import { Loader2, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { useCompanyMappingsByUser } from "@/hooks/iam/use-company-mapping"

interface Props {
    userId: string
}

export function UserCompanyMappingsCard({ userId }: Props) {
    const { data, isLoading, isError } = useCompanyMappingsByUser(userId)
    const mappings = data?.data ?? []

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading mappings…
            </div>
        )
    }
    if (isError) {
        return (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                Failed to load company mappings.
            </div>
        )
    }
    if (mappings.length === 0) {
        return (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                No company mappings assigned to this user yet.
            </div>
        )
    }
    return (
        <div className="rounded-lg border divide-y">
            {mappings.map((m) => {
                const path = [m.companyName, m.divisionName, m.departmentName, m.sectionName].filter(Boolean).join(" › ")
                return (
                    <div key={m.companyMappingId} className="flex items-start justify-between gap-2 p-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-sm">{m.code}</span>
                                <span className="text-sm text-muted-foreground truncate">— {m.name}</span>
                            </div>
                            <p className="mt-1 truncate text-xs text-muted-foreground">{path || "—"}</p>
                        </div>
                        {m.isPrimary && (
                            <Badge variant="default" className="shrink-0 gap-1">
                                <Star className="h-3 w-3" /> Primary
                            </Badge>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
