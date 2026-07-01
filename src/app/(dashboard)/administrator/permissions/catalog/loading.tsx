export default function PermissionCatalogLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
                ))}
            </div>
        </div>
    )
}
