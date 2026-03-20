"use client"

// Reset Password page with split-layout AuthCard

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard, AuthHeader, AuthFooter } from "@/components/auth/auth-card"
import { AUTH_API, AUTH_ROUTES } from "@/lib/auth/config"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const resetToken = searchParams.get("token") || ""

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    })

    const handleSubmit = async (data: ResetPasswordValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.RESET_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resetToken,
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword,
                }),
            })

            const result = await response.json()
            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Failed to reset password")
                return
            }

            setIsSuccess(true)
        } catch (err) {
            console.error("Reset password error:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (!resetToken) {
        return (
            <AuthCard>
                <AuthHeader
                    icon={<Lock className="h-7 w-7 text-primary-foreground" />}
                    title="Invalid Request"
                    description="Please start the password reset process again"
                />
                <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>
                    <Button className="w-full h-11">Go to Forgot Password</Button>
                </Link>
            </AuthCard>
        )
    }

    if (isSuccess) {
        return (
            <AuthCard>
                <AuthHeader
                    icon={<CheckCircle2 className="h-7 w-7 text-green-400" />}
                    title="Password reset successful"
                    description="Your password has been updated. You can now sign in with your new password."
                />
                <Button onClick={() => router.push(AUTH_ROUTES.LOGIN)} className="w-full h-11">
                    Sign In
                </Button>
            </AuthCard>
        )
    }

    return (
        <AuthCard>
            <AuthHeader
                icon={<Lock className="h-7 w-7 text-primary-foreground" />}
                title="Create new password"
                description="Your new password must be different from previous passwords"
            />

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...form.register("newPassword")}
                            className={cn(
                                "h-11 pr-10",
                                form.formState.errors.newPassword && "border-destructive"
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {form.formState.errors.newPassword && (
                        <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...form.register("confirmPassword")}
                            className={cn(
                                "h-11 pr-10",
                                form.formState.errors.confirmPassword && "border-destructive"
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li>At least 8 characters</li>
                        <li>One uppercase letter</li>
                        <li>One lowercase letter</li>
                        <li>One number</li>
                    </ul>
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full h-11 gap-2">
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Resetting...</> : "Reset Password"}
                </Button>
            </form>

            <AuthFooter>
                <Link href={AUTH_ROUTES.LOGIN} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />Back to login
                </Link>
            </AuthFooter>
        </AuthCard>
    )
}

function ResetPasswordLoading() {
    return (
        <AuthCard>
            <div className="flex flex-col items-center gap-2 text-center mb-6">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-8 w-48 mt-2" />
                <Skeleton className="h-5 w-72" />
            </div>
            <div className="space-y-4">
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-11 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-11 w-full" /></div>
                <Skeleton className="h-11 w-full mt-4" />
            </div>
        </AuthCard>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordContent />
        </Suspense>
    )
}
