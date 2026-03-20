"use client"

// Login page with split-layout AuthCard
// Handles login flow with optional 2FA

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { AuthCard, AuthHeader, AuthFooter } from "@/components/auth/auth-card"
import { useAuth } from "@/providers/auth-provider"
import { AUTH_API, AUTH_ROUTES } from "@/lib/auth/config"

interface LoginData {
    username: string
    password: string
    totpCode?: string
}

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [requires2FA, setRequires2FA] = useState(false)
    const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)

    const handleLogin = async (data: LoginData) => {
        setIsLoading(true)
        setError(null)

        try {
            // Build login data with 2FA support
            const username = requires2FA && credentials ? credentials.username : data.username
            const password = requires2FA && credentials ? credentials.password : data.password

            const result = await login({
                username,
                password,
                totpCode: data.totpCode,
            })

            if (result.requires2fa) {
                setRequires2FA(true)
                setCredentials({ username: data.username, password: data.password })
                return
            }

            if (!result.success) {
                setError(result.error || "Login failed. Please try again.")
                return
            }

            // Login successful — AuthProvider state is now updated
            router.push(AUTH_ROUTES.DASHBOARD)
        } catch (err) {
            console.error("Login error:", err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthCard>
            <AuthHeader
                logo="/logo.png"
                title="Welcome back"
                description={requires2FA
                    ? "Enter your two-factor authentication code"
                    : "Sign in to your GoApps account"}
            />

            <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                error={error}
                requires2FA={requires2FA}
            />

            <AuthFooter>
                {!requires2FA && (
                    <Link
                        href={AUTH_ROUTES.FORGOT_PASSWORD}
                        className="text-muted-foreground hover:text-primary transition-colors"
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
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        ← Back to login
                    </button>
                )}
            </AuthFooter>
        </AuthCard>
    )
}
