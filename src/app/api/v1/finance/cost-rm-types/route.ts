// CostRmType — list + create.
import { NextRequest, NextResponse } from "next/server"
import { getCostRmTypeClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostRmTypeClient()
    const response = await client.listCostRmTypes(
      {
        search: searchParams.get("search") || "",
        referenceTarget: searchParams.get("referenceTarget") || searchParams.get("reference_target") || "",
        activeFilter: searchParams.get("activeFilter") || searchParams.get("active_filter") || "",
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
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list cost rm types", validationErrors: [] }, data: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRmTypeClient()
    const response = await client.createCostRmType(body, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to create cost rm type", validationErrors: [] } }, { status: 500 })
  }
}
