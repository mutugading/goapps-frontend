"use client"

// Forgot Password page
// Email input to initiate password reset

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
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
        defaultValues: {
            email: "",
        },
    })

    const handleSubmit = async (data: ForgotPasswordValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.FORGOT_PASSWORD, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
            <Card className="border-0 shadow-2xl shadow-primary/5">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Check your email
                    </CardTitle>
                    <CardDescription className="text-base">
                        We&apos;ve sent a verification code to
                    </CardDescription>
                    <p className="font-medium text-foreground">{email}</p>
                </CardHeader>

                <CardContent className="text-center">
                    <Link href={`${AUTH_ROUTES.VERIFY_OTP}?email=${encodeURIComponent(email)}`}>
                        <Button className="w-full h-11">
                            Enter Verification Code
                        </Button>
                    </Link>
                </CardContent>

                <CardFooter className="flex justify-center pt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSuccess(false)
                            setEmail("")
                        }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Didn&apos;t receive the email? Try again
                    </button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1 text-center pb-8">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Mail className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Forgot password?
                </CardTitle>
                <CardDescription className="text-base">
                    Enter your email and we&apos;ll send you a verification code
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            disabled={isLoading}
                            {...form.register("email")}
                            className={cn(
                                "h-11 transition-all duration-200",
                                form.formState.errors.email && "border-destructive focus-visible:ring-destructive"
                            )}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                                {form.formState.errors.email.message}
                            </p>
                        )}
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
                                Sending...
                            </>
                        ) : (
                            "Send Verification Code"
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
