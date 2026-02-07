"use client"

import { Toaster } from "sonner"
import { ThemeProvider } from "./theme-provider"
import { QueryProvider } from "./query-provider"
import { PermissionProvider } from "./permission-provider"

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <QueryProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <PermissionProvider>
                    {children}
                </PermissionProvider>
                <Toaster richColors position="top-right" />
            </ThemeProvider>
        </QueryProvider>
    )
}
