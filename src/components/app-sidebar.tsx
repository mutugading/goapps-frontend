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
import { getVisibleNavigation, userData } from "@/config/navigation"
import { usePermission } from "@/lib/hooks"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { permissions } = usePermission()
    const visibleNavigation = React.useMemo(
        () => getVisibleNavigation(permissions),
        [permissions]
    )

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
                <NavUser user={userData} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
