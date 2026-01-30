"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface BreadcrumbItemType {
    label: string
    href?: string
}

interface DynamicBreadcrumbProps {
    items?: BreadcrumbItemType[]
    maxVisibleItems?: number
}

// Generate breadcrumbs from URL path
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItemType[] {
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length === 0) {
        return [{ label: "Home", href: "/" }]
    }

    const breadcrumbs: BreadcrumbItemType[] = [{ label: "Home", href: "/" }]
    let currentPath = ""

    for (const segment of segments) {
        currentPath += `/${segment}`
        const label = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

        breadcrumbs.push({
            label,
            href: currentPath,
        })
    }

    return breadcrumbs
}

export function DynamicBreadcrumb({ items, maxVisibleItems = 3 }: DynamicBreadcrumbProps) {
    const pathname = usePathname()

    // Use provided items or generate from path
    const breadcrumbs = items ?? generateBreadcrumbsFromPath(pathname)

    if (breadcrumbs.length === 0) {
        return null
    }

    // If we have more items than maxVisibleItems, collapse the middle ones
    // Pattern: First item > ... (dropdown) > Second-to-last > Last
    const shouldCollapse = breadcrumbs.length > maxVisibleItems

    if (!shouldCollapse) {
        // Render all items normally
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((item, index) => {
                        const isLast = index === breadcrumbs.length - 1
                        return (
                            <Fragment key={item.label + index}>
                                <BreadcrumbItem className={!isLast ? "hidden md:block" : undefined}>
                                    {isLast ? (
                                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={item.href ?? "#"}>{item.label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                            </Fragment>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        )
    }

    // Collapsed version: First > ... > Second-to-last > Last
    const firstItem = breadcrumbs[0]
    const lastItems = breadcrumbs.slice(-2) // Last 2 items
    const collapsedItems = breadcrumbs.slice(1, -2) // Middle items for dropdown

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* First item */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={firstItem.href ?? "#"}>{firstItem.label}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {/* Ellipsis with dropdown */}
                <BreadcrumbItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-6">
                                <BreadcrumbEllipsis />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuGroup>
                                {collapsedItems.map((item) => (
                                    <DropdownMenuItem key={item.label} asChild>
                                        <Link href={item.href ?? "#"}>{item.label}</Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {/* Last 2 items */}
                {lastItems.map((item, index) => {
                    const isLast = index === lastItems.length - 1
                    return (
                        <Fragment key={item.label}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href ?? "#"}>{item.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
