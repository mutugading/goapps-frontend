import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CostingProcessLoading() {
    return (
        <div>
            <div className="mb-6">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
            </Card>
        </div>
    )
}
