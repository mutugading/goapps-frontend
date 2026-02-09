"use client"

// Login page client component
// Handles the login flow with optional 2FA

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AUTH_API, AUTH_ROUTES } from "@/lib/auth/config"

interface LoginData {
    username: string
    password: string
    totpCode?: string
}

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [requires2FA, setRequires2FA] = useState(false)
    const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)

    const handleLogin = async (data: LoginData) => {
        setIsLoading(true)
        setError(null)

        try {
            // If 2FA required, include previously entered credentials
            // Don't send totpCode if empty, truncate deviceInfo to 100 chars max
            const deviceInfo = navigator.userAgent.slice(0, 100)
            const baseData = requires2FA && credentials
                ? { ...credentials, deviceInfo }
                : { username: data.username, password: data.password, deviceInfo }

            // Only add totpCode if it has a value
            const loginData = data.totpCode
                ? { ...baseData, totpCode: data.totpCode }
                : baseData

            const response = await fetch(AUTH_API.LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
                credentials: "include",
            })

            const result = await response.json()

            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Login failed. Please try again.")
                return
            }

            // Check if 2FA is required
            if (result.data?.requires2fa && !result.data?.user) {
                setRequires2FA(true)
                setCredentials({ username: data.username, password: data.password })
                return
            }

            // Success - redirect to dashboard
            router.push(AUTH_ROUTES.DASHBOARD)
            router.refresh()
        } catch (err) {
            console.error("Login error:", err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-0 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1 text-center pb-8">
                {/* Logo */}
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <Building2 className="h-7 w-7 text-primary-foreground" />
                </div>

                <CardTitle className="text-2xl font-bold tracking-tight">
                    Welcome back
                </CardTitle>
                <CardDescription className="text-base">
                    {requires2FA
                        ? "Enter your two-factor authentication code"
                        : "Sign in to your GoApps account"}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <LoginForm
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    error={error}
                    requires2FA={requires2FA}
                />
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-6">
                {!requires2FA && (
                    <Link
                        href={AUTH_ROUTES.FORGOT_PASSWORD}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Forgot your password?
                    </Link>
                )}

                {requires2FA && (
                    <button
                        type="button"
                        onClick={() => {
                            setRequires2FA(false)
                            setCredentials(null)
                            setError(null)
                        }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        ← Back to login
                    </button>
                )}
            </CardFooter>
        </Card>
    )
}
