"use client"

// Error Handler Hook

import { useCallback } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api"

export interface ErrorHandlerOptions {
  /** Default error message if error has no message */
  defaultMessage?: string
  /** Whether to show toast notification (default: true) */
  showToast?: boolean
  /** Custom error handler */
  onError?: (error: Error) => void
}

/**
 * Hook for handling errors in a consistent way
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { defaultMessage = "An error occurred", showToast = true, onError } = options

  const handleError = useCallback(
    (error: unknown) => {
      // Convert to Error if needed
      const err = error instanceof Error ? error : new Error(String(error))

      // Call custom handler if provided
      if (onError) {
        onError(err)
      }

      // Show toast if enabled
      if (showToast) {
        if (error instanceof ApiError) {
          // Show validation errors if present
          if (error.isValidationError) {
            const messages = error.validationErrors
              .map((e) => `${e.field}: ${e.message}`)
              .join("\n")
            toast.error(messages || error.message || defaultMessage)
          } else if (error.isNetworkError) {
            toast.error("Network error. Please check your connection.")
          } else {
            toast.error(error.message || defaultMessage)
          }
        } else {
          toast.error(err.message || defaultMessage)
        }
      }

      // Log error for debugging
      console.error("[Error]", err)

      return err
    },
    [defaultMessage, showToast, onError]
  )

  return { handleError }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(error: ApiError): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const ve of error.validationErrors) {
    errors[ve.field] = ve.message
  }

  return errors
}
