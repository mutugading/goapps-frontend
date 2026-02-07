// UOM API Service
// Handles all UOM-related API calls to the backend

import type {
  ListUOMsParams,
  ListUOMsResponse,
  GetUOMResponse,
  CreateUOMRequest,
  CreateUOMResponse,
  UpdateUOMRequest,
  UpdateUOMResponse,
  DeleteUOMResponse,
  ExportUOMsParams,
  ExportUOMsResponse,
  ImportUOMsRequest,
  ImportUOMsResponse,
  DownloadTemplateResponse,
} from "@/types/finance/uom"

// Base URL for the finance API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""
const UOM_API_PATH = "/api/v1/finance/uoms"

// ============================================================================
// Helper Functions
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    )
  }
  return response.json()
}

function buildQueryString(params: object): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

// ============================================================================
// UOM API Functions
// ============================================================================

/**
 * List UOMs with search, filter, and pagination
 */
export async function listUOMs(
  params: ListUOMsParams = {}
): Promise<ListUOMsResponse> {
  const queryString = buildQueryString(params)
  const response = await fetch(`${API_BASE_URL}${UOM_API_PATH}${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  return handleResponse<ListUOMsResponse>(response)
}

/**
 * Get a single UOM by ID
 */
export async function getUOM(uomId: string): Promise<GetUOMResponse> {
  const response = await fetch(`${API_BASE_URL}${UOM_API_PATH}/${uomId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  return handleResponse<GetUOMResponse>(response)
}

/**
 * Create a new UOM
 */
export async function createUOM(
  data: CreateUOMRequest
): Promise<CreateUOMResponse> {
  const response = await fetch(`${API_BASE_URL}${UOM_API_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })
  return handleResponse<CreateUOMResponse>(response)
}

/**
 * Update an existing UOM
 */
export async function updateUOM(
  uomId: string,
  data: UpdateUOMRequest
): Promise<UpdateUOMResponse> {
  const response = await fetch(`${API_BASE_URL}${UOM_API_PATH}/${uomId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })
  return handleResponse<UpdateUOMResponse>(response)
}

/**
 * Delete a UOM (soft delete)
 */
export async function deleteUOM(uomId: string): Promise<DeleteUOMResponse> {
  const response = await fetch(`${API_BASE_URL}${UOM_API_PATH}/${uomId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  return handleResponse<DeleteUOMResponse>(response)
}

/**
 * Export UOMs to Excel file
 */
export async function exportUOMs(
  params: ExportUOMsParams = {}
): Promise<ExportUOMsResponse> {
  const queryString = buildQueryString(params)
  const response = await fetch(
    `${API_BASE_URL}${UOM_API_PATH}/export${queryString}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  )
  return handleResponse<ExportUOMsResponse>(response)
}

/**
 * Import UOMs from Excel file
 */
export async function importUOMs(
  data: ImportUOMsRequest
): Promise<ImportUOMsResponse> {
  const response = await fetch(`${API_BASE_URL}${UOM_API_PATH}/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })
  return handleResponse<ImportUOMsResponse>(response)
}

/**
 * Download import template
 */
export async function downloadTemplate(): Promise<DownloadTemplateResponse> {
  const response = await fetch(`${API_BASE_URL}${UOM_API_PATH}/template`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  return handleResponse<DownloadTemplateResponse>(response)
}

// ============================================================================
// File Download Helper
// ============================================================================

/**
 * Download file from base64 content
 */
export function downloadFile(base64Content: string, fileName: string): void {
  const byteCharacters = atob(base64Content)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Read file as base64
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g., "data:application/...;base64,")
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
