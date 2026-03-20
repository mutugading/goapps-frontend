"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LogIn, LayoutDashboard, ArrowRight } from "lucide-react"

export default function HomePage() {
    const { isAuthenticated, isLoading } = useAuth()

    return (
        <div className="bg-muted flex min-h-svh flex-col">
            {/* Background decorations — same as auth layout */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/3 blur-3xl" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 md:px-10">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt={siteConfig.name}
                        width={36}
                        height={36}
                    />
                    <span className="text-lg font-semibold tracking-tight">
                        {siteConfig.name}
                    </span>
                </div>
                <div>
                    {isLoading ? (
                        <Skeleton className="h-9 w-28" />
                    ) : isAuthenticated ? (
                        <Button asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild>
                            <Link href="/login">
                                <LogIn className="h-4 w-4" />
                                Sign In
                            </Link>
                        </Button>
                    )}
                </div>
            </header>

            {/* Hero */}
            <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="max-w-2xl space-y-6">
                    <Image
                        src="/logo.png"
                        alt={siteConfig.name}
                        width={80}
                        height={80}
                        className="mx-auto"
                    />
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        {siteConfig.name}
                    </h1>
                    <p className="text-lg text-muted-foreground text-balance">
                        {siteConfig.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {siteConfig.organization.name}
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        {isLoading ? (
                            <Skeleton className="h-11 w-56" />
                        ) : isAuthenticated ? (
                            <Button size="lg" asChild>
                                <Link href="/dashboard">
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button size="lg" asChild>
                                <Link href="/login">
                                    Sign In to Get Started
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            </footer>
        </div>
    )
}
