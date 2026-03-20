"use client"

// OTP Verification page with split-layout AuthCard

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Shield, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthCard, AuthHeader, AuthFooter } from "@/components/auth/auth-card"
import { AUTH_API, AUTH_ROUTES } from "@/lib/auth/config"
import { Skeleton } from "@/components/ui/skeleton"

function VerifyOTPContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => { inputRefs.current[0]?.focus() }, [])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        const newOtp = [...otp]
        for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i]
        setOtp(newOtp)
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const otpCode = otp.join("")
        if (otpCode.length !== 6) {
            setError("Please enter the complete 6-digit code")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.VERIFY_OTP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otpCode }),
            })

            const result = await response.json()
            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Invalid verification code")
                return
            }

            router.push(`${AUTH_ROUTES.RESET_PASSWORD}?token=${encodeURIComponent(result.resetToken)}`)
        } catch (err) {
            console.error("Verify OTP error:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (!email) {
        return (
            <AuthCard>
                <AuthHeader
                    icon={<Shield className="h-7 w-7 text-primary-foreground" />}
                    title="Invalid Request"
                    description="Please start the password reset process again"
                />
                <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>
                    <Button className="w-full h-11">Go to Forgot Password</Button>
                </Link>
            </AuthCard>
        )
    }

    return (
        <AuthCard>
            <AuthHeader
                icon={<Shield className="h-7 w-7 text-primary-foreground" />}
                title="Verify your email"
                description={`Enter the 6-digit code sent to ${email}`}
            />

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-center gap-2 px-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <Input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={isLoading}
                            className="h-14 w-12 text-center text-xl font-bold"
                        />
                    ))}
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={isLoading || otp.join("").length !== 6} className="w-full h-11 gap-2">
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying...</> : "Verify Code"}
                </Button>
            </form>

            <AuthFooter>
                <Link href={AUTH_ROUTES.FORGOT_PASSWORD} className="text-muted-foreground hover:text-primary transition-colors">
                    Didn&apos;t receive the code? Resend
                </Link>
                <Link href={AUTH_ROUTES.LOGIN} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />Back to login
                </Link>
            </AuthFooter>
        </AuthCard>
    )
}

function VerifyOTPLoading() {
    return (
        <AuthCard>
            <div className="flex flex-col items-center gap-2 text-center mb-6">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-8 w-40 mt-2" />
                <Skeleton className="h-5 w-56" />
            </div>
            <div className="flex justify-center gap-2 mb-5">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-12" />)}
            </div>
            <Skeleton className="h-11 w-full" />
        </AuthCard>
    )
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<VerifyOTPLoading />}>
            <VerifyOTPContent />
        </Suspense>
    )
}
