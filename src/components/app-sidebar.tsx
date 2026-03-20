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
import { useUserDisplay } from "@/hooks/iam/use-current-user"
import { useMenuTree } from "@/hooks/iam/use-menu"
import { menuTreeToNavGroups, preloadMenuIcons } from "@/types/iam/menu"
import { Skeleton } from "@/components/ui/skeleton"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, isLoading: isUserLoading } = useUserDisplay()
    const { data: menuTree, isLoading: isMenuLoading } = useMenuTree()
    const [iconsReady, setIconsReady] = React.useState(false)

    // Preload icons once the tree arrives, then flip state to trigger re-render
    React.useEffect(() => {
        if (menuTree && menuTree.length > 0) {
            setIconsReady(false)
            preloadMenuIcons(menuTree)
                .then(() => setIconsReady(true))
                .catch(() => setIconsReady(true))
        }
    }, [menuTree])

    // Recompute nav groups after icons are loaded (iconsReady in deps triggers re-run)
    const navGroups = React.useMemo(
        () => (menuTree ? menuTreeToNavGroups(menuTree) : []),
        [menuTree, iconsReady] // eslint-disable-line react-hooks/exhaustive-deps
    )

    const displayUser = user ?? { name: "Loading...", email: "" }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SiteHeader />
            </SidebarHeader>
            <SidebarContent>
                {isMenuLoading ? (
                    <div className="space-y-2 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full rounded-md" />
                        ))}
                    </div>
                ) : (
                    navGroups.map((group) => (
                        <NavMain
                            key={group.title}
                            items={group.items}
                            label={group.title}
                        />
                    ))
                )}
            </SidebarContent>
            <SidebarFooter>
                {isUserLoading ? (
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
