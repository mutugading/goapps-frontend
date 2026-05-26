// CostRoute — list paginated heads.
import { NextRequest, NextResponse } from "next/server"
import { getCostRouteClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getCostRouteClient()
    const response = await client.listRoutes(
      {
        search: sp.get("search") || "",
        status: sp.get("status") || "",
        page: Number(sp.get("page")) || 1,
        pageSize: Number(sp.get("pageSize")) || 20,
        sortBy: sp.get("sortBy") || "",
        sortOrder: sp.get("sortOrder") || "",
      },
      metadata,
    )
    return NextResponse.json({
      base: response.base,
      data: response.data,
      pagination: response.pagination
        ? {
            currentPage: response.pagination.currentPage,
            pageSize: response.pagination.pageSize,
            totalItems: String(response.pagination.totalItems ?? 0),
            totalPages: response.pagination.totalPages,
          }
        : undefined,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list routes", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}
