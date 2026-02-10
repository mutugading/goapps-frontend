"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Copy, Check } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    qrCodeUrl: string
    secret: string
    onVerify: (code: string) => Promise<void>
}

export function QRCodeModal({
    open,
    onOpenChange,
    qrCodeUrl,
    secret,
    onVerify,
}: QRCodeModalProps) {
    const [code, setCode] = useState("")
    const [verifying, setVerifying] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(secret)
            setCopied(true)
            toast.success("Secret copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error("Failed to copy secret")
        }
    }

    const handleVerify = async () => {
        if (code.length !== 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }

        setVerifying(true)
        try {
            await onVerify(code)
        } finally {
            setVerifying(false)
        }
    }

    const handleClose = (open: boolean) => {
        if (!open) {
            setCode("")
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                        Scan the QR code with your authenticator app or enter the secret key manually.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* QR Code - Generated from otpauth:// URL */}
                    <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg">
                            {qrCodeUrl ? (
                                <QRCodeSVG
                                    value={qrCodeUrl}
                                    size={200}
                                    level="M"
                                    includeMargin={false}
                                />
                            ) : (
                                <div className="w-[200px] h-[200px] flex items-center justify-center bg-muted">
                                    <p className="text-sm text-muted-foreground">QR Code</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secret Key */}
                    <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                                {secret}
                            </code>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                                className="shrink-0"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            If you can&apos;t scan the QR code, enter this secret key in your authenticator app.
                        </p>
                    </div>

                    {/* Verification Code Input */}
                    <div className="space-y-2">
                        <Label htmlFor="verification-code">Verification Code</Label>
                        <Input
                            id="verification-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the 6-digit code from your authenticator app to verify setup.
                        </p>
                    </div>

                    {/* Verify Button */}
                    <Button
                        onClick={handleVerify}
                        disabled={verifying || code.length !== 6}
                        className="w-full"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify and Enable 2FA"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
