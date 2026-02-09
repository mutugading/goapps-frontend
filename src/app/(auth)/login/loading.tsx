// Loading skeleton for login page
import { Skeleton } from "@/components/ui/skeleton"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"

export default function LoginLoading() {
    return (
        <Card className="border-0 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1 text-center pb-8">
                <Skeleton className="mx-auto h-14 w-14 rounded-2xl" />
                <Skeleton className="mx-auto h-8 w-40 mt-4" />
                <Skeleton className="mx-auto h-5 w-56 mt-2" />
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Username field */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-11 w-full" />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 w-full" />
                </div>

                {/* Submit button */}
                <Skeleton className="h-11 w-full mt-2" />

                {/* Forgot password link */}
                <Skeleton className="mx-auto h-4 w-40 mt-4" />
            </CardContent>
        </Card>
    )
}
