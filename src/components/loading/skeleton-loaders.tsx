import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Generic loading skeleton for page content
export function PageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Page header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Chart skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </div>
    )
}

// Card skeleton
export function CardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
            </CardContent>
        </Card>
    )
}

// Chart skeleton
export function ChartSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Header row */}
                    <div className="flex gap-4 border-b pb-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    {/* Data rows */}
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex gap-4 py-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Dashboard skeleton (full page)
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Charts row */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4">
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Activity feed */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Sidebar skeleton
export function SidebarSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Logo/Header */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>

            {/* Navigation groups */}
            {Array.from({ length: 3 }).map((_, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    {Array.from({ length: groupIndex === 1 ? 5 : 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                    ))}
                </div>
            ))}

            {/* User at bottom */}
            <div className="mt-auto flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        </div>
    )
}
