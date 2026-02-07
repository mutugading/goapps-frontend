// API Client - Typed fetch wrapper with retry and timeout

import { ApiError, type RequestConfig, type HttpMethod, type ResponseParser } from "./types"
import { sleep, getBackoffDelay, isRetryableError, createTimeoutPromise } from "./utils"

const DEFAULT_TIMEOUT = 30000 // 30 seconds
const DEFAULT_RETRIES = 2

/**
 * API Client class for making typed HTTP requests
 */
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || ""
  }

  /**
   * Make a request with automatic retry and timeout handling
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    options: {
      body?: unknown
      config?: RequestConfig
      parser?: ResponseParser<T>
    } = {}
  ): Promise<T> {
    const { body, config = {}, parser } = options
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      headers = {},
      credentials = "include",
      signal,
    } = config

    const url = `${this.baseUrl}${path}`
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutPromise = createTimeoutPromise(timeout, signal)

        // Merge signals if external signal provided
        if (signal) {
          signal.addEventListener("abort", () => controller.abort())
        }

        const fetchPromise = fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          credentials,
          signal: controller.signal,
          body: body ? JSON.stringify(body) : undefined,
        })

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise])

        // Handle non-OK responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))

          // Check if we should retry
          if (isRetryableError(response.status) && attempt < retries) {
            lastError = new ApiError(
              errorData.message || `HTTP ${response.status}`,
              response.status,
              errorData.base?.validationErrors || errorData.validationErrors || []
            )
            await sleep(getBackoffDelay(attempt))
            continue
          }

          // Throw API error
          throw new ApiError(
            errorData.message || errorData.base?.message || `HTTP error ${response.status}`,
            response.status,
            errorData.base?.validationErrors || errorData.validationErrors || []
          )
        }

        // Parse response
        const data = await response.json()

        // Use custom parser if provided
        if (parser) {
          return parser(data)
        }

        return data as T
      } catch (error) {
        // Handle abort
        if (error instanceof Error && error.name === "AbortError") {
          throw ApiError.timeout()
        }

        // Handle timeout
        if (error instanceof Error && error.message === "Request timed out") {
          if (attempt < retries) {
            lastError = ApiError.timeout()
            await sleep(getBackoffDelay(attempt))
            continue
          }
          throw ApiError.timeout()
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes("fetch")) {
          if (attempt < retries) {
            lastError = ApiError.networkError(error.message)
            await sleep(getBackoffDelay(attempt))
            continue
          }
          throw ApiError.networkError(error.message)
        }

        // Re-throw ApiError as-is
        if (error instanceof ApiError) {
          throw error
        }

        // Wrap other errors
        throw new ApiError(
          error instanceof Error ? error.message : "Unknown error",
          500
        )
      }
    }

    // Should not reach here, but just in case
    throw lastError || new ApiError("Request failed after retries")
  }

  /**
   * GET request
   */
  async get<T>(path: string, config?: RequestConfig, parser?: ResponseParser<T>): Promise<T> {
    return this.request<T>("GET", path, { config, parser })
  }

  /**
   * POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig,
    parser?: ResponseParser<T>
  ): Promise<T> {
    return this.request<T>("POST", path, { body, config, parser })
  }

  /**
   * PUT request
   */
  async put<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig,
    parser?: ResponseParser<T>
  ): Promise<T> {
    return this.request<T>("PUT", path, { body, config, parser })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig,
    parser?: ResponseParser<T>
  ): Promise<T> {
    return this.request<T>("PATCH", path, { body, config, parser })
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: RequestConfig, parser?: ResponseParser<T>): Promise<T> {
    return this.request<T>("DELETE", path, { config, parser })
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient()
