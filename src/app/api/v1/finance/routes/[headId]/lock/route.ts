import { NextRequest, NextResponse } from "next/server"
import { getCostRouteClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ headId: string }> }) {
  try {
    const { headId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRouteClient()
    const response = await client.lockRoute({ headId: Number(headId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to lock route", validationErrors: [] } },
      { status: 500 },
    )
  }
}
