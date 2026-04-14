"use client"

// Email verification page
// Shows OTP input for email verification after login

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthCard, AuthHeader, AuthFooter } from "@/components/auth/auth-card"
import { AUTH_API, AUTH_ROUTES } from "@/lib/auth/config"

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmailPage() {
    const router = useRouter()

    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [cooldown, setCooldown] = useState(0)
    const [hasSentInitial, setHasSentInitial] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Send verification code
    const sendVerification = useCallback(async (isResend = false) => {
        setIsSending(true)
        setError(null)

        try {
            const endpoint = isResend
                ? AUTH_API.RESEND_EMAIL_VERIFICATION
                : AUTH_API.SEND_EMAIL_VERIFICATION

            const response = await fetch(endpoint, {
                method: "POST",
                credentials: "include",
            })

            const result = await response.json()

            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Failed to send verification code")
                return
            }

            setSuccess(result.message || "Verification code sent to your email")
            setCooldown(RESEND_COOLDOWN_SECONDS)
        } catch (err) {
            console.error("Send verification error:", err)
            setError("Failed to send verification code")
        } finally {
            setIsSending(false)
        }
    }, [])

    // Auto-send on mount
    useEffect(() => {
        if (!hasSentInitial) {
            setHasSentInitial(true)
            sendVerification(false)
        }
    }, [hasSentInitial, sendVerification])

    // Focus first input
    useEffect(() => { inputRefs.current[0]?.focus() }, [])

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [cooldown])

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
        const code = otp.join("")
        if (code.length !== 6) {
            setError("Please enter the complete 6-digit code")
            return
        }

        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch(AUTH_API.VERIFY_EMAIL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
                credentials: "include",
            })

            const result = await response.json()
            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Invalid verification code")
                return
            }

            // Email verified — redirect to dashboard
            router.push(AUTH_ROUTES.DASHBOARD)
            router.refresh()
        } catch (err) {
            console.error("Verify email error:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthCard>
            <AuthHeader
                icon={<Mail className="h-7 w-7 text-primary-foreground" />}
                title="Verify your email"
                description="Enter the 6-digit code sent to your email address"
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

                {success && (
                    <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg text-center dark:text-green-400 dark:bg-green-950 dark:border-green-800">
                        {success}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full h-11 gap-2"
                >
                    {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Verifying...</>
                    ) : (
                        "Verify Email"
                    )}
                </Button>
            </form>

            <AuthFooter>
                <button
                    type="button"
                    onClick={() => sendVerification(true)}
                    disabled={isSending || cooldown > 0}
                    className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        "Sending..."
                    ) : cooldown > 0 ? (
                        `Resend code in ${cooldown}s`
                    ) : (
                        "Resend verification code"
                    )}
                </button>
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
