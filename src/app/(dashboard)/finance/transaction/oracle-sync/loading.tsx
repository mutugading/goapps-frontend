import { TableSkeleton } from "@/components/loading"

export default function OracleSyncLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                <div className="h-4 w-96 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <TableSkeleton rows={6} />
        </div>
    )
}
