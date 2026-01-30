"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/common/dynamic-breadcrumb"
import { Footer } from "@/components/common/footer"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
