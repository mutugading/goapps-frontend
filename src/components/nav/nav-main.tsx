"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

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
import {
    type MenuItem,
    filterVisibleMenus,
    isPathActive,
} from "@/config/navigation"

interface NavMainProps {
    items: MenuItem[]
    label?: string
}

/**
 * Check if any child (recursive) has matching path
 */
function hasActiveChild(item: MenuItem, currentPath: string): boolean {
    if (item.url && isPathActive(item.url, currentPath)) {
        return true
    }
    if (item.children) {
        return item.children.some((child) => hasActiveChild(child, currentPath))
    }
    return false
}

export function NavMain({ items, label = "Platform" }: NavMainProps) {
    const pathname = usePathname()
    const visibleItems = filterVisibleMenus(items)

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {visibleItems.map((item) => (
                    <NavMenuItem key={item.id} item={item} currentPath={pathname} />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

interface NavMenuItemProps {
    item: MenuItem
    currentPath: string
}

function NavMenuItem({ item, currentPath }: NavMenuItemProps) {
    const isActive = item.url ? isPathActive(item.url, currentPath) : false
    const hasActiveDescendant = hasActiveChild(item, currentPath)

    // If no children, render as a simple link
    if (!item.children || item.children.length === 0) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link href={item.url || "#"}>
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
            defaultOpen={isActive || hasActiveDescendant}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children.map((subItem) => (
                            <NavSubMenuItem
                                key={subItem.id}
                                subItem={subItem}
                                currentPath={currentPath}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

interface NavSubMenuItemProps {
    subItem: MenuItem
    currentPath: string
}

function NavSubMenuItem({ subItem, currentPath }: NavSubMenuItemProps) {
    const isActive = subItem.url ? isPathActive(subItem.url, currentPath) : false
    const hasActiveDescendant = hasActiveChild(subItem, currentPath)

    // If sub-item has its own children (3rd level) - use Collapsible without nesting li
    if (subItem.children && subItem.children.length > 0) {
        return (
            <SidebarMenuSubItem>
                <Collapsible
                    defaultOpen={isActive || hasActiveDescendant}
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
                            {subItem.children.map((thirdLevel) => {
                                const isThirdLevelActive = thirdLevel.url
                                    ? isPathActive(thirdLevel.url, currentPath)
                                    : false
                                return (
                                    <Link
                                        key={thirdLevel.id}
                                        href={thirdLevel.url || "#"}
                                        className={`flex h-7 items-center rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                                            isThirdLevelActive
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                : "text-sidebar-foreground/70"
                                        }`}
                                    >
                                        {thirdLevel.title}
                                    </Link>
                                )
                            })}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuSubItem>
        )
    }

    // Regular sub-item (2nd level leaf)
    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild isActive={isActive}>
                <Link href={subItem.url || "#"}>
                    <span>{subItem.title}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    )
}
