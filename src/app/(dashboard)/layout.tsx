"use client"

import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/common/dynamic-breadcrumb"
import { Footer } from "@/components/common/footer"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

function DashboardSkeleton() {
    return (
        <div className="flex h-svh w-full">
            {/* Sidebar skeleton */}
            <div className="hidden md:flex w-64 flex-col border-r bg-background p-4 gap-4">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-2 mt-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                    ))}
                </div>
            </div>
            {/* Main content skeleton */}
            <div className="flex-1 flex flex-col">
                <div className="h-16 border-b flex items-center px-4 gap-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex-1 p-4 space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/")
        }
    }, [isLoading, isAuthenticated, router])

    // Show skeleton while checking auth
    if (isLoading) {
        return <DashboardSkeleton />
    }

    // Don't render dashboard content for unauthenticated users
    if (!isAuthenticated) {
        return <DashboardSkeleton />
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Sticky header with breadcrumbs */}
                <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <DynamicBreadcrumb />
                    </div>
                </header>
                {/* Main content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <main className="flex-1 pt-4">
                        {children}
                    </main>
                    <Footer />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
