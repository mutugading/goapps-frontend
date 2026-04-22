import { Loader2 } from "lucide-react"

export default function GroupDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-72 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}
