"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Loader2, Shield, ShieldCheck, ShieldOff, Smartphone } from "lucide-react"
import { AUTH_API } from "@/lib/auth/config"
import { QRCodeModal } from "./qr-code-modal"

export function TwoFactorSettings() {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false)
    const [loading, setLoading] = useState(true)
    const [enabling, setEnabling] = useState(false)
    const [disabling, setDisabling] = useState(false)
    const [showQRModal, setShowQRModal] = useState(false)
    const [showDisableDialog, setShowDisableDialog] = useState(false)
    const [qrData, setQRData] = useState<{ qrCodeUrl: string; secret: string } | null>(null)
    const [disableCode, setDisableCode] = useState("")

    // Fetch current 2FA status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch("/api/v1/iam/users/me")
                const data = await response.json()
                if (data.base?.isSuccess) {
                    setIs2FAEnabled(data.data?.user?.twoFactorEnabled || false)
                }
            } catch (error) {
                console.error("Error fetching 2FA status:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
    }, [])

    const handleEnable2FA = async () => {
        try {
            setEnabling(true)
            const response = await fetch(AUTH_API.ENABLE_2FA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            })

            const data = await response.json()

            if (data.base?.isSuccess && data.data) {
                setQRData({
                    qrCodeUrl: data.data.qrCodeUrl || data.data.qr_code_url,
                    secret: data.data.secret,
                })
                setShowQRModal(true)
            } else {
                toast.error(data.base?.message || "Failed to enable 2FA")
            }
        } catch (error) {
            console.error("Error enabling 2FA:", error)
            toast.error("Failed to enable 2FA")
        } finally {
            setEnabling(false)
        }
    }

    const handleVerify2FA = async (code: string) => {
        try {
            const response = await fetch(AUTH_API.VERIFY_2FA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totpCode: code }),
            })

            const data = await response.json()

            if (data.base?.isSuccess) {
                setIs2FAEnabled(true)
                setShowQRModal(false)
                setQRData(null)
                toast.success("Two-factor authentication enabled successfully")
            } else {
                toast.error(data.base?.message || "Invalid verification code")
            }
        } catch (error) {
            console.error("Error verifying 2FA:", error)
            toast.error("Failed to verify 2FA code")
        }
    }

    const handleDisable2FA = async () => {
        if (disableCode.length !== 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }

        try {
            setDisabling(true)
            const response = await fetch(AUTH_API.DISABLE_2FA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totpCode: disableCode }),
            })

            const data = await response.json()

            if (data.base?.isSuccess) {
                setIs2FAEnabled(false)
                setShowDisableDialog(false)
                setDisableCode("")
                toast.success("Two-factor authentication disabled")
            } else {
                toast.error(data.base?.message || "Failed to disable 2FA")
            }
        } catch (error) {
            console.error("Error disabling 2FA:", error)
            toast.error("Failed to disable 2FA")
        } finally {
            setDisabling(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Status Display */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    {is2FAEnabled ? (
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                        </div>
                    ) : (
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <ShieldOff className="h-5 w-5 text-amber-600" />
                        </div>
                    )}
                    <div>
                        <p className="font-medium">
                            {is2FAEnabled ? "2FA is Enabled" : "2FA is Disabled"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {is2FAEnabled
                                ? "Your account is protected with two-factor authentication"
                                : "Add an extra layer of security to your account"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            {is2FAEnabled ? (
                <Button
                    variant="destructive"
                    onClick={() => setShowDisableDialog(true)}
                    disabled={disabling}
                >
                    {disabling ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ShieldOff className="mr-2 h-4 w-4" />
                    )}
                    Disable 2FA
                </Button>
            ) : (
                <Button onClick={handleEnable2FA} disabled={enabling}>
                    {enabling ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Shield className="mr-2 h-4 w-4" />
                    )}
                    Enable 2FA
                </Button>
            )}

            {/* How it works */}
            <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    How it works
                </h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>Scan the QR code with your authenticator app</li>
                    <li>Enter the 6-digit code to verify setup</li>
                    <li>Use codes from the app when logging in</li>
                </ol>
            </div>

            {/* QR Code Modal */}
            {qrData && (
                <QRCodeModal
                    open={showQRModal}
                    onOpenChange={setShowQRModal}
                    qrCodeUrl={qrData.qrCodeUrl}
                    secret={qrData.secret}
                    onVerify={handleVerify2FA}
                />
            )}

            {/* Disable 2FA Dialog */}
            <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter your current 2FA code to disable two-factor authentication.
                            Your account will be less secure after disabling 2FA.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="disable-code">Verification Code</Label>
                        <Input
                            id="disable-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            value={disableCode}
                            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                            className="mt-2"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDisableCode("")}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDisable2FA}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={disabling || disableCode.length !== 6}
                        >
                            {disabling ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Disable 2FA
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
