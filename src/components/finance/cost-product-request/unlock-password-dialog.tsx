"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, Loader2, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "lock" or "unlock" — changes title, description, and button label */
  action: "lock" | "unlock"
  isPending: boolean
  /** Called with the entered password when user confirms */
  onConfirm: (password: string) => void
  /** Inline error message (e.g., "Invalid password") */
  error?: string
}

export function UnlockPasswordDialog({ open, onOpenChange, action, isPending, onConfirm, error }: Props) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  function handleConfirm() {
    if (!password.trim()) return
    onConfirm(password)
  }

  function handleClose(v: boolean) {
    if (!v) {
      setPassword("")
      setShowPassword(false)
    }
    onOpenChange(v)
  }

  const isLocking = action === "lock"
  const Icon = isLocking ? Lock : Unlock
  const title = isLocking ? "Lock Route" : "Unlock Route"
  const description = isLocking
    ? "Param values will become read-only for everyone. Creator and approvers will be notified."
    : "Param values will become editable again. Creator and approvers will be notified."
  const confirmLabel = isLocking ? "Confirm Lock" : "Confirm Unlock"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">Enter your account password to confirm:</p>
          <div className="space-y-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm()
                }}
                autoComplete="current-password"
                disabled={isPending}
                className={error ? "border-destructive" : ""}
              />
              <button
                type="button"
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!password.trim() || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
