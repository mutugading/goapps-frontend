export default function CostResultDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}
