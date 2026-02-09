"use client"

// Login form component
// Handles username/password input with optional 2FA

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { Loader2, Eye, EyeOff, Shield, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    totpCode: z.string().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
    onSubmit: (data: LoginFormValues) => Promise<void>
    isLoading?: boolean
    error?: string | null
    requires2FA?: boolean
}

export function LoginForm({
    onSubmit,
    isLoading = false,
    error,
    requires2FA = false,
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
            totpCode: "",
        },
    })

    const handleSubmit = async (data: LoginFormValues) => {
        await onSubmit(data)
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Username field */}
            <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                    Username or Email
                </Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    autoComplete="username"
                    disabled={isLoading}
                    {...form.register("username")}
                    className={cn(
                        "h-11 transition-all duration-200",
                        form.formState.errors.username && "border-destructive focus-visible:ring-destructive"
                    )}
                />
                {form.formState.errors.username && (
                    <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                        {form.formState.errors.username.message}
                    </p>
                )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                    Password
                </Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...form.register("password")}
                        className={cn(
                            "h-11 pr-10 transition-all duration-200",
                            form.formState.errors.password && "border-destructive focus-visible:ring-destructive"
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {form.formState.errors.password && (
                    <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                        {form.formState.errors.password.message}
                    </p>
                )}
            </div>

            {/* 2FA field - conditionally shown */}
            {requires2FA && (
                <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2">
                    <Label htmlFor="totpCode" className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Two-Factor Code
                    </Label>
                    <Input
                        id="totpCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        autoComplete="one-time-code"
                        maxLength={6}
                        disabled={isLoading}
                        {...form.register("totpCode")}
                        className="h-11 text-center text-lg tracking-widest font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                        Enter the code from your authenticator app
                    </p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in-0 slide-in-from-top-1">
                    {error}
                </div>
            )}

            {/* Submit button */}
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-medium gap-2 transition-all duration-200"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    <>
                        <LogIn className="h-4 w-4" />
                        Sign In
                    </>
                )}
            </Button>
        </form>
    )
}
