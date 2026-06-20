import { TableSkeleton } from "@/components/loading"

export default function CalcScheduleLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-52 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <TableSkeleton rows={8} />
    </div>
  )
}
