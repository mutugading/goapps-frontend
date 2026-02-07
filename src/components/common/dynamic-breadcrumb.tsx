"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbLink,
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
import { buildBreadcrumbTrail, breadcrumbConfig } from "@/config/navigation"

export interface BreadcrumbItemType {
    label: string
    href?: string
}

interface DynamicBreadcrumbProps {
    items?: BreadcrumbItemType[]
    maxVisibleItems?: number
}

/**
 * Generate breadcrumbs from URL path using breadcrumbConfig as fallback
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItemType[] {
    // Try navigation-aware trail first
    const navTrail = buildBreadcrumbTrail(pathname)
    if (navTrail) {
        return navTrail
    }

    // Fallback: build from URL segments using breadcrumbConfig
    const segments = pathname.split("/").filter(Boolean)

    if (segments.length === 0 || pathname === "/dashboard") {
        return [{ label: "Home" }]
    }

    const breadcrumbs: BreadcrumbItemType[] = []
    let currentPath = ""

    breadcrumbs.push({ label: "Home", href: "/dashboard" })

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        currentPath += `/${segment}`
        const isLast = i === segments.length - 1

        const config = breadcrumbConfig[currentPath]

        if (config) {
            breadcrumbs.push({
                label: config.title,
                href: isLast ? undefined : config.href,
            })
        } else {
            const label = segment
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")

            breadcrumbs.push({
                label,
                href: isLast ? undefined : currentPath,
            })
        }
    }

    return breadcrumbs
}

export function DynamicBreadcrumb({ items, maxVisibleItems = 4 }: DynamicBreadcrumbProps) {
    const pathname = usePathname()

    const breadcrumbs = items ?? generateBreadcrumbsFromPath(pathname)

    if (breadcrumbs.length === 0) {
        return null
    }

    const shouldCollapse = breadcrumbs.length > maxVisibleItems

    if (!shouldCollapse) {
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
                                    ) : item.href ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={item.href}>{item.label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <span className="text-muted-foreground">{item.label}</span>
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
    const lastItems = breadcrumbs.slice(-2)
    const collapsedItems = breadcrumbs.slice(1, -2)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* First item */}
                <BreadcrumbItem>
                    {firstItem.href ? (
                        <BreadcrumbLink asChild>
                            <Link href={firstItem.href}>{firstItem.label}</Link>
                        </BreadcrumbLink>
                    ) : (
                        <span className="text-muted-foreground">{firstItem.label}</span>
                    )}
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
                                    <DropdownMenuItem key={item.label} asChild={!!item.href}>
                                        {item.href ? (
                                            <Link href={item.href}>{item.label}</Link>
                                        ) : (
                                            <span>{item.label}</span>
                                        )}
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
                                ) : item.href ? (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <span className="text-muted-foreground">{item.label}</span>
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
