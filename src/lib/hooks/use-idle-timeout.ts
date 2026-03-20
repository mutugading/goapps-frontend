"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IDLE_CONFIG } from "@/lib/auth/config"

interface UseIdleTimeoutOptions {
    /** Total idle timeout in ms (default: IDLE_CONFIG.TIMEOUT). */
    timeout?: number
    /** Show warning this many ms before timeout (default: IDLE_CONFIG.WARNING_BEFORE). */
    warningBefore?: number
    /** Called when idle timeout is reached. */
    onTimeout: () => void
    /** Whether idle detection is enabled (e.g., only when authenticated). */
    enabled?: boolean
}

interface UseIdleTimeoutReturn {
    /** True when the warning period has started but timeout hasn't fired yet. */
    isWarning: boolean
    /** Seconds remaining until timeout (only meaningful when isWarning is true). */
    remainingSeconds: number
    /** Reset the idle timer (e.g., user clicked "Stay logged in"). */
    resetTimer: () => void
}

/**
 * Hook that detects user inactivity and triggers a timeout.
 * Shows a warning period before the final timeout fires.
 */
export function useIdleTimeout({
    timeout = IDLE_CONFIG.TIMEOUT,
    warningBefore = IDLE_CONFIG.WARNING_BEFORE,
    onTimeout,
    enabled = true,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
    const [isWarning, setIsWarning] = useState(false)
    const [remainingSeconds, setRemainingSeconds] = useState(0)
    // eslint-disable-next-line react-hooks/purity -- Date.now() in ref init is safe; ref doesn't affect render output
    const lastActivityRef = useRef(Date.now())
    const onTimeoutRef = useRef(onTimeout)

    // Keep callback ref fresh without re-triggering effects
    onTimeoutRef.current = onTimeout

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now()
        setIsWarning(false)
        setRemainingSeconds(0)
    }, [])

    // Track user activity
    useEffect(() => {
        if (!enabled) return

        const onActivity = () => {
            lastActivityRef.current = Date.now()
            // If we're in the warning state and user becomes active, dismiss it
            setIsWarning(false)
        }

        for (const event of IDLE_CONFIG.ACTIVITY_EVENTS) {
            window.addEventListener(event, onActivity, { passive: true })
        }

        return () => {
            for (const event of IDLE_CONFIG.ACTIVITY_EVENTS) {
                window.removeEventListener(event, onActivity)
            }
        }
    }, [enabled])

    // Periodic check for idle state
    useEffect(() => {
        if (!enabled) return

        const interval = setInterval(() => {
            const elapsed = Date.now() - lastActivityRef.current
            const remaining = timeout - elapsed

            if (remaining <= 0) {
                // Timeout reached — log user out
                clearInterval(interval)
                setIsWarning(false)
                onTimeoutRef.current()
            } else if (remaining <= warningBefore) {
                // In warning zone
                setIsWarning(true)
                setRemainingSeconds(Math.ceil(remaining / 1000))
            } else {
                setIsWarning(false)
                setRemainingSeconds(0)
            }
        }, IDLE_CONFIG.CHECK_INTERVAL)

        return () => clearInterval(interval)
    }, [enabled, timeout, warningBefore])

    return { isWarning, remainingSeconds, resetTimer }
}
