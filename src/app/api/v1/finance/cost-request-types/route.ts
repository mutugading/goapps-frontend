import { NextRequest, NextResponse } from "next/server"
import { getCostRequestTypeClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostRequestTypeClient()
    const response = await client.listCostRequestTypes(
      {
        search: searchParams.get("search") || "",
        activeFilter: searchParams.get("activeFilter") || searchParams.get("active_filter") || "active",
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 50,
        },
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data, pagination: response.pagination })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list cost request types", validationErrors: [] }, data: [] }, { status: 500 })
  }
}
