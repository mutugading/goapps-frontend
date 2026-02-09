"use client"

// Two-Factor Authentication Setup Component
// Displays QR code and recovery codes for 2FA setup

import { useState } from "react"
import { QrCode, Copy, Check, Shield, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AUTH_API } from "@/lib/auth/config"

interface TwoFactorSetupData {
    secret: string
    qrCodeUrl: string
    recoveryCodes: string[]
}

interface TwoFactorSetupProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function TwoFactorSetup({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) {
    const [step, setStep] = useState<"password" | "qr" | "verify" | "recovery">("password")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [totpCode, setTotpCode] = useState("")
    const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null)
    const [copiedSecret, setCopiedSecret] = useState(false)
    const [copiedRecovery, setCopiedRecovery] = useState(false)

    const handleEnable2FA = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.ENABLE_2FA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ password }),
            })

            const result = await response.json()

            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Failed to enable 2FA")
                return
            }

            setSetupData(result.data)
            setStep("qr")
        } catch (err) {
            console.error("Enable 2FA error:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify2FA = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.VERIFY_2FA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ totpCode }),
            })

            const result = await response.json()

            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Invalid verification code")
                return
            }

            setStep("recovery")
        } catch (err) {
            console.error("Verify 2FA error:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopySecret = async () => {
        if (setupData?.secret) {
            await navigator.clipboard.writeText(setupData.secret)
            setCopiedSecret(true)
            setTimeout(() => setCopiedSecret(false), 2000)
        }
    }

    const handleCopyRecoveryCodes = async () => {
        if (setupData?.recoveryCodes) {
            await navigator.clipboard.writeText(setupData.recoveryCodes.join("\n"))
            setCopiedRecovery(true)
            setTimeout(() => setCopiedRecovery(false), 2000)
        }
    }

    const handleDownloadRecoveryCodes = () => {
        if (setupData?.recoveryCodes) {
            const content = `GoApps Recovery Codes\n${"=".repeat(40)}\n\nKeep these codes safe! Each code can only be used once.\n\n${setupData.recoveryCodes.join("\n")}\n`
            const blob = new Blob([content], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "goapps-recovery-codes.txt"
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const handleClose = () => {
        setStep("password")
        setPassword("")
        setTotpCode("")
        setSetupData(null)
        setError(null)
        onOpenChange(false)
        if (step === "recovery" && onSuccess) {
            onSuccess()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {/* Step 1: Password */}
                {step === "password" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Enable Two-Factor Authentication
                            </DialogTitle>
                            <DialogDescription>
                                Enter your password to begin 2FA setup.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleEnable2FA} disabled={isLoading || !password}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* Step 2: QR Code */}
                {step === "qr" && setupData && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-primary" />
                                Scan QR Code
                            </DialogTitle>
                            <DialogDescription>
                                Scan this QR code with your authenticator app.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* QR Code */}
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <img
                                    src={setupData.qrCodeUrl}
                                    alt="2FA QR Code"
                                    className="w-48 h-48"
                                />
                            </div>

                            {/* Manual entry */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    Can&apos;t scan? Enter this code manually:
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={setupData.secret}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopySecret}
                                    >
                                        {copiedSecret ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep("password")}>
                                Back
                            </Button>
                            <Button onClick={() => setStep("verify")}>
                                Continue
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* Step 3: Verify */}
                {step === "verify" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Verify Setup</DialogTitle>
                            <DialogDescription>
                                Enter the 6-digit code from your authenticator app.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="totpCode">Verification Code</Label>
                                <Input
                                    id="totpCode"
                                    type="text"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest font-mono"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep("qr")}>
                                Back
                            </Button>
                            <Button onClick={handleVerify2FA} disabled={isLoading || totpCode.length !== 6}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* Step 4: Recovery Codes */}
                {step === "recovery" && setupData && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-green-600 dark:text-green-400">
                                2FA Enabled Successfully!
                            </DialogTitle>
                            <DialogDescription>
                                Save these recovery codes. Each code can only be used once.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                                {setupData.recoveryCodes.map((code, index) => (
                                    <div key={index} className="p-2 bg-background rounded text-center">
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleCopyRecoveryCodes}
                                >
                                    {copiedRecovery ? (
                                        <Check className="h-4 w-4 mr-2 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4 mr-2" />
                                    )}
                                    Copy
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleDownloadRecoveryCodes}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
