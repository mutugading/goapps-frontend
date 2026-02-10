"use client"

// Forgot Password page with split-layout AuthCard

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard, AuthHeader, AuthFooter } from "@/components/auth/auth-card"
import { AUTH_API, AUTH_ROUTES } from "@/lib/auth/config"
import { cn } from "@/lib/utils"

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [email, setEmail] = useState("")

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    })

    const handleSubmit = async (data: ForgotPasswordValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.FORGOT_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Failed to send reset email")
                return
            }

            setEmail(data.email)
            setIsSuccess(true)
        } catch (err) {
            console.error("Forgot password error:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    // Success state
    if (isSuccess) {
        return (
            <AuthCard>
                <AuthHeader
                    icon={<CheckCircle2 className="h-7 w-7 text-green-400" />}
                    title="Check your email"
                    description={`We've sent a verification code to ${email}`}
                />

                <Link href={`${AUTH_ROUTES.VERIFY_OTP}?email=${encodeURIComponent(email)}`}>
                    <Button className="w-full h-11">Enter Verification Code</Button>
                </Link>

                <AuthFooter>
                    <button
                        type="button"
                        onClick={() => { setIsSuccess(false); setEmail("") }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        Didn&apos;t receive the email? Try again
                    </button>
                </AuthFooter>
            </AuthCard>
        )
    }

    return (
        <AuthCard>
            <AuthHeader
                icon={<Mail className="h-7 w-7 text-primary-foreground" />}
                title="Forgot password?"
                description="Enter your email and we'll send you a verification code"
            />

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={isLoading}
                        {...form.register("email")}
                        className={cn(
                            "h-11",
                            form.formState.errors.email && "border-destructive focus-visible:ring-destructive"
                        )}
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full h-11 gap-2">
                    {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Sending...</>
                    ) : (
                        "Send Verification Code"
                    )}
                </Button>
            </form>

            <AuthFooter>
                <Link
                    href={AUTH_ROUTES.LOGIN}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />Back to login
                </Link>
            </AuthFooter>
        </AuthCard>
    )
}
