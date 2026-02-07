// API Proxy Handler Factory
// Reduces boilerplate in Next.js API routes by providing reusable proxy handlers

import { NextRequest, NextResponse } from "next/server"

/**
 * Service configuration for backend proxying
 */
export interface ServiceConfig {
  /** Environment variable name for service URL (e.g., "FINANCE_SERVICE_URL") */
  serviceUrlEnv: string
  /** Default URL if env var is not set */
  defaultUrl?: string
}

/**
 * Common service configurations
 */
export const SERVICES = {
  FINANCE: {
    serviceUrlEnv: "FINANCE_SERVICE_URL",
    defaultUrl: "http://localhost:8080",
  },
  IAM: {
    serviceUrlEnv: "IAM_SERVICE_URL",
    defaultUrl: "http://localhost:8081",
  },
  PURCHASE: {
    serviceUrlEnv: "PURCHASE_SERVICE_URL",
    defaultUrl: "http://localhost:8082",
  },
  SALES: {
    serviceUrlEnv: "SALES_SERVICE_URL",
    defaultUrl: "http://localhost:8083",
  },
  INVENTORY: {
    serviceUrlEnv: "INVENTORY_SERVICE_URL",
    defaultUrl: "http://localhost:8084",
  },
} as const

/**
 * Get backend URL for a service
 */
function getBackendUrl(config: ServiceConfig): string {
  return process.env[config.serviceUrlEnv] || config.defaultUrl || "http://localhost:8080"
}

/**
 * Forward authentication and cookie headers from the request
 */
function getForwardHeaders(request: NextRequest, contentType: string = "application/json"): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": contentType,
  }

  // Forward authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    headers["Authorization"] = authHeader
  }

  // Forward cookies
  const cookies = request.headers.get("cookie")
  if (cookies) {
    headers["Cookie"] = cookies
  }

  // Forward request ID for tracing
  const requestId = request.headers.get("x-request-id")
  if (requestId) {
    headers["X-Request-Id"] = requestId
  }

  return headers
}

/**
 * Create standard error response following BaseResponse pattern
 */
function createErrorResponse(
  message: string,
  statusCode: number = 500,
  additionalFields?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      base: {
        isSuccess: false,
        statusCode: statusCode.toString(),
        message,
        validationErrors: [],
      },
      ...additionalFields,
    },
    { status: statusCode }
  )
}

/**
 * Route context with dynamic params (Next.js 15+ pattern)
 */
export type RouteContext<T extends Record<string, string> = Record<string, string>> = {
  params: Promise<T>
}

/**
 * Proxy handler configuration
 */
export interface ProxyConfig {
  /** Service configuration */
  service: ServiceConfig
  /** Base API path on backend (e.g., "/api/v1/finance/uoms") */
  basePath: string
  /** Resource name for error messages (e.g., "unit of measure") */
  resourceName: string
}

/**
 * Create proxy handlers for a resource
 *
 * @example
 * ```ts
 * // In app/api/v1/finance/uoms/route.ts
 * const proxy = createProxyHandlers({
 *   service: SERVICES.FINANCE,
 *   basePath: "/api/v1/finance/uoms",
 *   resourceName: "unit of measure",
 * })
 *
 * export const GET = proxy.list()
 * export const POST = proxy.create()
 * ```
 */
export function createProxyHandlers(config: ProxyConfig) {
  const { service, basePath, resourceName } = config
  const backendUrl = getBackendUrl(service)

  return {
    /**
     * GET handler for listing resources with query params
     */
    list: () => async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url)
        const queryString = searchParams.toString()
        const url = `${backendUrl}${basePath}${queryString ? `?${queryString}` : ""}`

        const response = await fetch(url, {
          method: "GET",
          headers: getForwardHeaders(request),
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
      } catch (error) {
        console.error(`Error fetching ${resourceName}s:`, error)
        return createErrorResponse(`Failed to fetch ${resourceName}s`, 500, {
          data: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
          },
        })
      }
    },

    /**
     * POST handler for creating a resource
     */
    create: () => async (request: NextRequest) => {
      try {
        const body = await request.json()

        const response = await fetch(`${backendUrl}${basePath}`, {
          method: "POST",
          headers: getForwardHeaders(request),
          body: JSON.stringify(body),
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
      } catch (error) {
        console.error(`Error creating ${resourceName}:`, error)
        return createErrorResponse(`Failed to create ${resourceName}`)
      }
    },

    /**
     * GET handler for getting a single resource by ID
     */
    get: <T extends string = "id">(paramName: T = "id" as T) =>
      async (request: NextRequest, context: RouteContext<Record<T, string>>) => {
        try {
          const params = await context.params
          const id = params[paramName]

          const response = await fetch(`${backendUrl}${basePath}/${id}`, {
            method: "GET",
            headers: getForwardHeaders(request),
          })

          const data = await response.json()
          return NextResponse.json(data, { status: response.status })
        } catch (error) {
          console.error(`Error fetching ${resourceName}:`, error)
          return createErrorResponse(`Failed to fetch ${resourceName}`)
        }
      },

    /**
     * PUT handler for updating a resource by ID
     */
    update: <T extends string = "id">(paramName: T = "id" as T) =>
      async (request: NextRequest, context: RouteContext<Record<T, string>>) => {
        try {
          const params = await context.params
          const id = params[paramName]
          const body = await request.json()

          const response = await fetch(`${backendUrl}${basePath}/${id}`, {
            method: "PUT",
            headers: getForwardHeaders(request),
            body: JSON.stringify(body),
          })

          const data = await response.json()
          return NextResponse.json(data, { status: response.status })
        } catch (error) {
          console.error(`Error updating ${resourceName}:`, error)
          return createErrorResponse(`Failed to update ${resourceName}`)
        }
      },

    /**
     * DELETE handler for deleting a resource by ID
     */
    delete: <T extends string = "id">(paramName: T = "id" as T) =>
      async (request: NextRequest, context: RouteContext<Record<T, string>>) => {
        try {
          const params = await context.params
          const id = params[paramName]

          const response = await fetch(`${backendUrl}${basePath}/${id}`, {
            method: "DELETE",
            headers: getForwardHeaders(request),
          })

          const data = await response.json()
          return NextResponse.json(data, { status: response.status })
        } catch (error) {
          console.error(`Error deleting ${resourceName}:`, error)
          return createErrorResponse(`Failed to delete ${resourceName}`)
        }
      },

    /**
     * GET handler for export endpoint (with query params)
     */
    export: (exportPath: string = "/export") => async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url)
        const queryString = searchParams.toString()
        const url = `${backendUrl}${basePath}${exportPath}${queryString ? `?${queryString}` : ""}`

        const response = await fetch(url, {
          method: "GET",
          headers: getForwardHeaders(request),
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
      } catch (error) {
        console.error(`Error exporting ${resourceName}s:`, error)
        return createErrorResponse(`Failed to export ${resourceName}s`)
      }
    },

    /**
     * POST handler for import endpoint
     */
    import: (importPath: string = "/import", additionalErrorFields?: Record<string, unknown>) =>
      async (request: NextRequest) => {
        try {
          const body = await request.json()

          const response = await fetch(`${backendUrl}${basePath}${importPath}`, {
            method: "POST",
            headers: getForwardHeaders(request),
            body: JSON.stringify(body),
          })

          const data = await response.json()
          return NextResponse.json(data, { status: response.status })
        } catch (error) {
          console.error(`Error importing ${resourceName}s:`, error)
          return createErrorResponse(`Failed to import ${resourceName}s`, 500, {
            successCount: 0,
            skippedCount: 0,
            updatedCount: 0,
            failedCount: 0,
            errors: [],
            ...additionalErrorFields,
          })
        }
      },

    /**
     * GET handler for template download endpoint
     */
    template: (templatePath: string = "/template") => async (request: NextRequest) => {
      try {
        const response = await fetch(`${backendUrl}${basePath}${templatePath}`, {
          method: "GET",
          headers: getForwardHeaders(request),
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
      } catch (error) {
        console.error(`Error downloading ${resourceName} template:`, error)
        return createErrorResponse(`Failed to download template`)
      }
    },

    /**
     * Generic proxy for custom endpoints
     */
    custom: <T extends Record<string, string> = Record<string, never>>(
      method: "GET" | "POST" | "PUT" | "DELETE",
      customPath: string,
      options?: {
        hasBody?: boolean
        hasQueryParams?: boolean
        paramName?: keyof T
        errorFields?: Record<string, unknown>
      }
    ) =>
      async (request: NextRequest, context?: RouteContext<T>) => {
        try {
          let url = `${backendUrl}${basePath}${customPath}`

          // Replace path params if context provided
          if (context && options?.paramName) {
            const params = await context.params
            const id = params[options.paramName as string]
            url = url.replace(`:${options.paramName as string}`, id)
          }

          // Add query params if needed
          if (options?.hasQueryParams) {
            const { searchParams } = new URL(request.url)
            const queryString = searchParams.toString()
            if (queryString) {
              url += `?${queryString}`
            }
          }

          const fetchOptions: RequestInit = {
            method,
            headers: getForwardHeaders(request),
          }

          // Add body if needed
          if (options?.hasBody && (method === "POST" || method === "PUT")) {
            fetchOptions.body = JSON.stringify(await request.json())
          }

          const response = await fetch(url, fetchOptions)
          const data = await response.json()
          return NextResponse.json(data, { status: response.status })
        } catch (error) {
          console.error(`Error on custom endpoint ${customPath}:`, error)
          return createErrorResponse(
            `Failed to process request`,
            500,
            options?.errorFields
          )
        }
      },
  }
}

// Re-export utilities that might be useful in route handlers
export { getForwardHeaders, createErrorResponse, getBackendUrl }
