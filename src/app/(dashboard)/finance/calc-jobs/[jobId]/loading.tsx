import { TableSkeleton } from "@/components/loading"

export default function CalcJobDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-12 w-full bg-muted animate-pulse rounded mt-4" />
      </div>
      <TableSkeleton rows={6} />
    </div>
  )
}
