import { TableSkeleton } from "@/components/loading"

export default function Loading() {
  return (
    <div className="space-y-6">
      <TableSkeleton rows={5} />
    </div>
  )
}
