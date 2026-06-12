import { NextRequest, NextResponse } from "next/server"
import { getCostProductRequestClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductRequestClient()
    const response = await client.getCostProductRequestHistory({ requestId: Number(requestId) }, metadata)
    return NextResponse.json({ base: response.base, entries: response.entries })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch history", validationErrors: [] } },
      { status: 500 },
    )
  }
}
