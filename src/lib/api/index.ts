// API Client exports
export { ApiClient, apiClient } from "./client"
export { ApiError, type RequestConfig, type HttpMethod, type ResponseParser } from "./types"
export {
  buildQueryString,
  sleep,
  getBackoffDelay,
  isRetryableError,
  downloadFile,
  downloadFileFromBytes,
  readFileAsBase64,
  readFileAsBytes,
} from "./utils"

// API Proxy exports (for Next.js API routes)
export {
  createProxyHandlers,
  SERVICES,
  getForwardHeaders,
  createErrorResponse,
  getBackendUrl,
  type ServiceConfig,
  type ProxyConfig,
  type RouteContext,
} from "./proxy"
