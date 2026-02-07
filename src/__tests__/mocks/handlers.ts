// MSW Request Handlers - Mock API endpoints for testing
import { http, HttpResponse } from "msw"

// Base URL for test API - must match NEXT_PUBLIC_API_URL in setup.ts
const API_BASE = "http://localhost:3000"

// Sample UOM data for testing
export const mockUOMs = [
  {
    uomId: "uom-001",
    uomCode: "KG",
    uomName: "Kilogram",
    uomCategory: 1, // WEIGHT
    description: "Unit for weight measurement",
    isActive: true,
    auditInfo: {
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
      updatedAt: "2024-01-01T00:00:00Z",
      updatedBy: "system",
    },
  },
  {
    uomId: "uom-002",
    uomCode: "MTR",
    uomName: "Meter",
    uomCategory: 2, // LENGTH
    description: "Unit for length measurement",
    isActive: true,
    auditInfo: {
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
      updatedAt: "2024-01-01T00:00:00Z",
      updatedBy: "system",
    },
  },
]

// Base response structure
const createBaseResponse = (isSuccess: boolean, message: string = "") => ({
  isSuccess,
  statusCode: isSuccess ? "200" : "500",
  message,
  validationErrors: [],
})

// Create pagination response
const createPagination = (totalItems: number, page: number = 1, pageSize: number = 10) => ({
  currentPage: page,
  pageSize,
  totalItems,
  totalPages: Math.ceil(totalItems / pageSize),
})

export const handlers = [
  // List UOMs
  http.get(`${API_BASE}/api/v1/finance/uoms`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const pageSize = parseInt(url.searchParams.get("page_size") || "10")
    const search = url.searchParams.get("search") || ""

    let filteredUOMs = mockUOMs
    if (search) {
      filteredUOMs = mockUOMs.filter(
        (uom) =>
          uom.uomCode.toLowerCase().includes(search.toLowerCase()) ||
          uom.uomName.toLowerCase().includes(search.toLowerCase())
      )
    }

    return HttpResponse.json({
      base: createBaseResponse(true, "UOMs fetched successfully"),
      data: filteredUOMs,
      pagination: createPagination(filteredUOMs.length, page, pageSize),
    })
  }),

  // Get single UOM
  http.get(`${API_BASE}/api/v1/finance/uoms/:uomId`, ({ params }) => {
    const { uomId } = params
    const uom = mockUOMs.find((u) => u.uomId === uomId)

    if (!uom) {
      return HttpResponse.json(
        {
          base: createBaseResponse(false, "UOM not found"),
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      base: createBaseResponse(true, "UOM fetched successfully"),
      data: uom,
    })
  }),

  // Create UOM
  http.post(`${API_BASE}/api/v1/finance/uoms`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    const newUOM = {
      uomId: `uom-${Date.now()}`,
      uomCode: body.uomCode,
      uomName: body.uomName,
      uomCategory: body.uomCategory,
      description: body.description || "",
      isActive: body.isActive ?? true,
      auditInfo: {
        createdAt: new Date().toISOString(),
        createdBy: "test-user",
        updatedAt: new Date().toISOString(),
        updatedBy: "test-user",
      },
    }

    return HttpResponse.json({
      base: createBaseResponse(true, "UOM created successfully"),
      data: newUOM,
    })
  }),

  // Update UOM
  http.put(`${API_BASE}/api/v1/finance/uoms/:uomId`, async ({ params, request }) => {
    const { uomId } = params
    const body = (await request.json()) as Record<string, unknown>
    const existingUOM = mockUOMs.find((u) => u.uomId === uomId)

    if (!existingUOM) {
      return HttpResponse.json(
        {
          base: createBaseResponse(false, "UOM not found"),
        },
        { status: 404 }
      )
    }

    const updatedUOM = {
      ...existingUOM,
      ...body,
      auditInfo: {
        ...existingUOM.auditInfo,
        updatedAt: new Date().toISOString(),
        updatedBy: "test-user",
      },
    }

    return HttpResponse.json({
      base: createBaseResponse(true, "UOM updated successfully"),
      data: updatedUOM,
    })
  }),

  // Delete UOM
  http.delete(`${API_BASE}/api/v1/finance/uoms/:uomId`, ({ params }) => {
    const { uomId } = params
    const existingUOM = mockUOMs.find((u) => u.uomId === uomId)

    if (!existingUOM) {
      return HttpResponse.json(
        {
          base: createBaseResponse(false, "UOM not found"),
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      base: createBaseResponse(true, "UOM deleted successfully"),
    })
  }),

  // Export UOMs
  http.get(`${API_BASE}/api/v1/finance/uoms/export`, () => {
    return HttpResponse.json({
      base: createBaseResponse(true, "UOMs exported successfully"),
      fileContent: [], // Empty array for testing
      fileName: "uoms-export.xlsx",
    })
  }),

  // Import UOMs
  http.post(`${API_BASE}/api/v1/finance/uoms/import`, () => {
    return HttpResponse.json({
      base: createBaseResponse(true, "UOMs imported successfully"),
      successCount: 5,
      updatedCount: 2,
      skippedCount: 1,
      failedCount: 0,
      errors: [],
    })
  }),

  // Download template
  http.get(`${API_BASE}/api/v1/finance/uoms/template`, () => {
    return HttpResponse.json({
      base: createBaseResponse(true, "Template downloaded successfully"),
      fileContent: [], // Empty array for testing
      fileName: "uom-template.xlsx",
    })
  }),
]
