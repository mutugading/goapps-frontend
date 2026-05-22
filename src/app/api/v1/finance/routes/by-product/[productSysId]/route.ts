import { NextRequest, NextResponse } from "next/server"
import { getCostRouteClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ productSysId: string }> }) {
  try {
    const { productSysId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRouteClient()
    const response = await client.getRouteByProduct({ productSysId: Number(productSysId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to load route by product", validationErrors: [] } },
      { status: 500 },
    )
  }
}
