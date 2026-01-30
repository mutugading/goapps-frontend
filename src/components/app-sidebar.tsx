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
import { navigation, userData } from "@/config/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SiteHeader />
            </SidebarHeader>
            <SidebarContent>
                {navigation.map((group) => (
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
