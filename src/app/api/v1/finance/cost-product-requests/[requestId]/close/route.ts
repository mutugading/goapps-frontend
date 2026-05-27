import { NextRequest, NextResponse } from "next/server"
import { getCostProductRequestClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductRequestClient()
    const response = await client.closeCostProductRequest({
      requestId: Number(requestId), closedSubstatus: body.closedSubstatus || body.closed_substatus || "won",
    }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to close", validationErrors: [] } }, { status: 500 })
  }
}
