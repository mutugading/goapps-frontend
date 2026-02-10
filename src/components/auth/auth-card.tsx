"use client"

// AuthCard - Shared split-layout card for all auth pages
// Left: Form content, Right: Company image
// Responsive: Image hidden on mobile

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface AuthCardProps {
    children: React.ReactNode
    className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
    return (
        <Card className={cn("overflow-hidden border-0 shadow-2xl shadow-primary/10 py-0", className)}>
            <CardContent className="grid p-0 md:grid-cols-2">
                {/* Form side */}
                <div className="p-6 md:p-8">
                    {children}
                </div>

                {/* Image side - hidden on mobile */}
                <div className="relative hidden md:block">
                    <Image
                        src="/mutugading-base.jpg"
                        alt="PT Mutu Gading Tekstil"
                        fill
                        sizes="(max-width: 768px) 0vw, 50vw"
                        className="object-cover dark:brightness-[0.3] dark:grayscale-[30%]"
                        priority
                    />
                    {/* Gradient overlay for better text readability if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
            </CardContent>
        </Card>
    )
}

interface AuthHeaderProps {
    icon?: React.ReactNode
    logo?: string
    title: string
    description: string
}

export function AuthHeader({ icon, logo, title, description }: AuthHeaderProps) {
    return (
        <div className="flex flex-col items-center gap-2 text-center mb-6">
            {logo ? (
                <Image
                    src={logo}
                    alt="Logo"
                    width={56}
                    height={56}
                    className="mb-2"
                />
            ) : icon ? (
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-2">
                    {icon}
                </div>
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-balance">{description}</p>
        </div>
    )
}

interface AuthFooterProps {
    children: React.ReactNode
    className?: string
}

export function AuthFooter({ children, className }: AuthFooterProps) {
    return (
        <div className={cn("flex flex-col items-center gap-3 pt-6 text-sm", className)}>
            {children}
        </div>
    )
}
