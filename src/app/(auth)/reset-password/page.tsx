"use client"

// Reset Password page
// New password form with confirmation

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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AUTH_API, AUTH_ROUTES } from "@/lib/auth/config"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const resetPasswordSchema = z.object({
    newPassword: z
        .string()
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
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    })

    const handleSubmit = async (data: ResetPasswordValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.RESET_PASSWORD, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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

    // Invalid token state
    if (!resetToken) {
        return (
            <Card className="border-0 shadow-2xl shadow-primary/5">
                <CardHeader className="space-y-1 text-center pb-8">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Invalid Request
                    </CardTitle>
                    <CardDescription className="text-base">
                        Please start the password reset process again
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>
                        <Button className="w-full h-11">
                            Go to Forgot Password
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    // Success state
    if (isSuccess) {
        return (
            <Card className="border-0 shadow-2xl shadow-primary/5">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Password reset successful
                    </CardTitle>
                    <CardDescription className="text-base">
                        Your password has been updated. You can now sign in with your new password.
                    </CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                    <Button
                        onClick={() => router.push(AUTH_ROUTES.LOGIN)}
                        className="w-full h-11"
                    >
                        Sign In
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1 text-center pb-8">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Lock className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Create new password
                </CardTitle>
                <CardDescription className="text-base">
                    Your new password must be different from previous passwords
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...form.register("newPassword")}
                                className={cn(
                                    "h-11 pr-10 transition-all duration-200",
                                    form.formState.errors.newPassword && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.newPassword && (
                            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                {form.formState.errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...form.register("confirmPassword")}
                                className={cn(
                                    "h-11 pr-10 transition-all duration-200",
                                    form.formState.errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Password requirements */}
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
                        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in-0 slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 font-medium gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center pt-6">
                <Link
                    href={AUTH_ROUTES.LOGIN}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </Link>
            </CardFooter>
        </Card>
    )
}

// Loading fallback for Suspense
function ResetPasswordLoading() {
    return (
        <Card className="border-0 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1 text-center pb-8">
                <Skeleton className="mx-auto h-14 w-14 rounded-2xl" />
                <Skeleton className="mx-auto h-8 w-48 mt-4" />
                <Skeleton className="mx-auto h-5 w-72 mt-2" />
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-11 w-full" />
                </div>
                <Skeleton className="h-11 w-full mt-4" />
            </CardContent>
        </Card>
    )
}

// Default export with Suspense boundary
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading />}>
            <ResetPasswordContent />
        </Suspense>
    )
}

