"use client"

// Two-Factor Authentication Disable Component
// Confirms 2FA removal with password and TOTP/recovery code

import { useState } from "react"
import { ShieldOff, Loader2 } from "lucide-react"
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

interface TwoFactorDisableProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function TwoFactorDisable({ open, onOpenChange, onSuccess }: TwoFactorDisableProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [verificationCode, setVerificationCode] = useState("")

    const handleDisable2FA = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(AUTH_API.DISABLE_2FA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ password, verificationCode }),
            })

            const result = await response.json()

            if (!response.ok || !result.base?.isSuccess) {
                setError(result.base?.message || "Failed to disable 2FA")
                return
            }

            // Success
            handleClose()
            onSuccess?.()
        } catch (err) {
            console.error("Disable 2FA error:", err)
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setPassword("")
        setVerificationCode("")
        setError(null)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <ShieldOff className="h-5 w-5" />
                        Disable Two-Factor Authentication
                    </DialogTitle>
                    <DialogDescription>
                        This will remove 2FA from your account. Enter your password and a
                        verification code to confirm.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="disable-password">Password</Label>
                        <Input
                            id="disable-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="disable-code">Verification Code</Label>
                        <Input
                            id="disable-code"
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="6-digit code or recovery code"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter a code from your authenticator app or a recovery code.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDisable2FA}
                        disabled={isLoading || !password || !verificationCode}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Disabling...
                            </>
                        ) : (
                            "Disable 2FA"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
