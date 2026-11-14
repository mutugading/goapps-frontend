import { Skeleton } from "@/components/ui/skeleton"

export default function PayrollRunDetailLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
