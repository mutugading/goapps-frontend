// GET — params NOT yet applicable for the product (Add Parameter picker).
import { NextRequest, NextResponse } from "next/server"
import { getCostProductParameterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productSysId: string }> },
) {
  try {
    const { productSysId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductParameterClient()
    const response = await client.listAvailableParams(
      { productSysId: Number(productSysId || 0) },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}
