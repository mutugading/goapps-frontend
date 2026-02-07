"use client"

import { Loader2, AlertTriangle, Info, CheckCircle } from "lucide-react"

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
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Handler for open state changes */
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title: string
  /** Dialog description */
  description: string
  /** Dialog variant (affects icon and button colors) */
  variant?: "default" | "destructive" | "warning" | "success"
  /** Loading state */
  isLoading?: boolean
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Confirm handler */
  onConfirm: () => void | Promise<void>
}

const variantIcons = {
  default: Info,
  destructive: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle,
}

const variantColors = {
  default: "text-primary",
  destructive: "text-destructive",
  warning: "text-yellow-500",
  success: "text-green-500",
}

const variantButtonStyles = {
  default: "",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  success: "bg-green-500 text-white hover:bg-green-600",
}

/**
 * Reusable confirmation dialog component
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "default",
  isLoading = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}: ConfirmDialogProps) {
  const Icon = variantIcons[variant]

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", variantColors[variant])} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={variantButtonStyles[variant]}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
