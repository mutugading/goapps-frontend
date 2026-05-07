"use client"

import { Toaster } from "sonner"
import { ThemeProvider } from "./theme-provider"
import { QueryProvider } from "./query-provider"
import { AuthProvider } from "./auth-provider"
import { PermissionProvider } from "./permission-provider"
import { NotificationProvider } from "./notification-provider"

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
                <AuthProvider>
                    <PermissionProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </PermissionProvider>
                </AuthProvider>
                <Toaster richColors position="top-right" />
            </ThemeProvider>
        </QueryProvider>
    )
}

