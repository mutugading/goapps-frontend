// BI Dashboards — list (GET) + create (POST).

import { NextRequest, NextResponse } from "next/server"
import {
  getBiDashboardClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

// GET /api/v1/finance/bi/dashboards — paginated admin list.
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.listDashboards(
      {
        page: Number(sp.get("page")) || 1,
        pageSize: Number(sp.get("pageSize") || sp.get("page_size")) || 20,
        search: sp.get("search") || "",
        groupId: sp.get("groupId") || "",
        filterType: sp.get("filterType") || "",
        includeInactive: sp.get("includeInactive") === "true",
        sortBy: sp.get("sortBy") || "",
        sortOrder: sp.get("sortOrder") || "",
      },
      metadata
    )
    return NextResponse.json({
      base: response.base,
      data: response.data,
      pagination: response.pagination,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI dashboards error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list dashboards", validationErrors: [] }, data: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
      { status: 500 }
    )
  }
}

// POST /api/v1/finance/bi/dashboards — create dashboard.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.createDashboard(body, metadata)
    return NextResponse.json({ base: response.base, data: response.data }, { status: 201 })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Create BI dashboard error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to create dashboard", validationErrors: [] } },
      { status: 500 }
    )
  }
}
