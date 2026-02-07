"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode
  /** Fallback UI to render on error (optional) */
  fallback?: ReactNode
  /** Custom error handler */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Whether to show error details (default: development only) */
  showErrorDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error boundary component for catching and displaying render errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)

    // Log error for debugging
    console.error("[ErrorBoundary] Caught error:", error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const showDetails =
        this.props.showErrorDetails ?? process.env.NODE_ENV === "development"

      return (
        <div className="flex min-h-[200px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Please try again.
              </p>
              {showDetails && this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <p className="font-mono text-xs text-muted-foreground">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="mt-2 max-h-32 overflow-auto text-xs text-muted-foreground">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Error fallback component for use with ErrorBoundary
 */
export interface ErrorFallbackProps {
  /** Error message to display */
  message?: string
  /** Retry handler */
  onRetry?: () => void
}

export function ErrorFallback({
  message = "Something went wrong",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[200px] items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
