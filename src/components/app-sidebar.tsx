"use client"

import * as React from "react"

import { NavMain, NavUser, SiteHeader } from "@/components/nav"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { getVisibleNavigation } from "@/config/navigation"
import { usePermission } from "@/lib/hooks"
import { useUserDisplay } from "@/hooks/iam/use-current-user"
import { Skeleton } from "@/components/ui/skeleton"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { permissions } = usePermission()
    const { user, isLoading } = useUserDisplay()
    const visibleNavigation = React.useMemo(
        () => getVisibleNavigation(permissions),
        [permissions]
    )

    // Default fallback user for loading state
    const displayUser = user ?? { name: "Loading...", email: "" }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SiteHeader />
            </SidebarHeader>
            <SidebarContent>
                {visibleNavigation.map((group) => (
                    <NavMain
                        key={group.title}
                        items={group.items}
                        label={group.title}
                    />
                ))}
            </SidebarContent>
            <SidebarFooter>
                {isLoading ? (
                    <div className="flex items-center gap-2 p-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ) : (
                    <NavUser user={displayUser} />
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

