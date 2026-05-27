// Single route head: DELETE (soft).
import { NextRequest, NextResponse } from "next/server"
import { getCostRouteClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ headId: string }> }) {
  try {
    const { headId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRouteClient()
    const response = await client.deleteRoute({ headId: Number(headId) }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to delete route", validationErrors: [] } },
      { status: 500 },
    )
  }
}
