// Auth route group layout
// Minimal layout for auth pages (login, forgot password, etc.)

import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "GoApps - Authentication",
    description: "Sign in to your GoApps account",
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-background via-background to-muted/50">
            {/* Background decorations */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Content */}
            <main className="relative w-full max-w-md px-4 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} GoApps. All rights reserved.</p>
            </footer>
        </div>
    )
}
