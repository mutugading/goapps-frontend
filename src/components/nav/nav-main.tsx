"use client"

import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Support up to 3 levels of navigation
export interface NavSubItem {
    title: string
    url: string
    isActive?: boolean
}

export interface NavSubMenu {
    title: string
    url: string
    isActive?: boolean
    items?: NavSubItem[]
}

export interface NavItem {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: NavSubMenu[]
}

interface NavMainProps {
    items: NavItem[]
    label?: string
}

export function NavMain({ items, label = "Platform" }: NavMainProps) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <NavMenuItem key={item.title} item={item} />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function NavMenuItem({ item }: { item: NavItem }) {
    // If no children, render as a simple link
    if (!item.items || item.items.length === 0) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    // With children, render as collapsible
    return (
        <Collapsible
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.items.map((subItem) => (
                            <NavSubMenuItem key={subItem.title} subItem={subItem} />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

function NavSubMenuItem({ subItem }: { subItem: NavSubMenu }) {
    // If sub-item has its own children (3rd level) - use Collapsible without nesting li
    if (subItem.items && subItem.items.length > 0) {
        return (
            <SidebarMenuSubItem>
                <Collapsible
                    defaultOpen={subItem.isActive}
                    className="group/subcollapsible"
                >
                    <CollapsibleTrigger asChild>
                        <SidebarMenuSubButton className="cursor-pointer">
                            <span>{subItem.title}</span>
                            <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
                        </SidebarMenuSubButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        {/* Use div instead of ul/li to avoid nested li hydration error */}
                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                            {subItem.items.map((thirdLevel) => (
                                <Link
                                    key={thirdLevel.title}
                                    href={thirdLevel.url}
                                    className="flex h-7 items-center rounded-md px-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    {thirdLevel.title}
                                </Link>
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuSubItem>
        )
    }

    // Regular sub-item (2nd level leaf)
    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
                <Link href={subItem.url}>
                    <span>{subItem.title}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    )
}
