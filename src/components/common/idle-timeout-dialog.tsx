"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface IdleTimeoutDialogProps {
    open: boolean
    remainingSeconds: number
    onStayLoggedIn: () => void
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
        return `${mins}m ${secs}s`
    }
    return `${secs}s`
}

export function IdleTimeoutDialog({
    open,
    remainingSeconds,
    onStayLoggedIn,
}: IdleTimeoutDialogProps) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have been inactive. Your session will expire in{" "}
                        <span className="font-semibold text-foreground">
                            {formatTime(remainingSeconds)}
                        </span>
                        . Click below to stay logged in.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onStayLoggedIn}>
                        Stay Logged In
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
