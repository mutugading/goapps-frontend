// CostProductType — list + create.
import { NextRequest, NextResponse } from "next/server"
import { getCostProductTypeClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductTypeClient()
    const response = await client.listCostProductTypes(
      {
        search: searchParams.get("search") || "",
        activeFilter: searchParams.get("activeFilter") || searchParams.get("active_filter") || "",
        sortBy: searchParams.get("sortBy") || searchParams.get("sort_by") || "",
        sortOrder: searchParams.get("sortOrder") || searchParams.get("sort_order") || "",
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 20,
        },
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data, pagination: response.pagination })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list cost product types", validationErrors: [] }, data: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductTypeClient()
    const response = await client.createCostProductType(body, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to create cost product type", validationErrors: [] } }, { status: 500 })
  }
}
