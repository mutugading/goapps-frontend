// Auth route group layout
// Full-width layout for split-card auth pages

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
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            {/* Background decorations */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Content - wider for split layout */}
            <main className="w-full max-w-sm md:max-w-4xl">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-8 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} GoApps. All rights reserved.</p>
            </footer>
        </div>
    )
}
