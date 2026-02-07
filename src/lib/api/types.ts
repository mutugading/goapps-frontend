// API Client Types

import type { BaseResponse, ValidationError } from "@/types/generated/common/v1/common"

/**
 * Custom API error with structured error information
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly validationErrors: ValidationError[]
  public readonly isNetworkError: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    validationErrors: ValidationError[] = [],
    isNetworkError: boolean = false
  ) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.validationErrors = validationErrors
    this.isNetworkError = isNetworkError
  }

  static fromBaseResponse(base: BaseResponse): ApiError {
    return new ApiError(
      base.message || "An error occurred",
      parseInt(base.statusCode, 10) || 500,
      base.validationErrors
    )
  }

  static networkError(message: string = "Network error"): ApiError {
    return new ApiError(message, 0, [], true)
  }

  static timeout(): ApiError {
    return new ApiError("Request timed out", 408, [], false)
  }

  /**
   * Get validation error for a specific field
   */
  getFieldError(field: string): string | undefined {
    return this.validationErrors.find((e) => e.field === field)?.message
  }

  /**
   * Check if this is a validation error
   */
  get isValidationError(): boolean {
    return this.validationErrors.length > 0
  }
}

/**
 * Request configuration
 */
export interface RequestConfig {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  /** Number of retry attempts (default: 2) */
  retries?: number
  /** Custom headers */
  headers?: Record<string, string>
  /** Whether to include credentials (default: true) */
  credentials?: RequestCredentials
  /** Signal for request cancellation */
  signal?: AbortSignal
}

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

/**
 * Response parser function type
 */
export type ResponseParser<T> = (data: unknown) => T
