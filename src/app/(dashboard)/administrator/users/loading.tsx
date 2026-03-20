import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function UsersLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-64" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                    <div className="space-y-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
