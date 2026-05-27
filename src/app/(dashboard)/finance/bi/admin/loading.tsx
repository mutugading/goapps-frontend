import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
