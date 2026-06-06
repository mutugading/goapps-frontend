// Delete global fill config for a specific route level.
import { NextRequest, NextResponse } from "next/server"
import { getFillConfigClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ level: string }> }) {
  try {
    const { level } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getFillConfigClient()
    const response = await client.deleteGlobalConfig({ routeLevel: Number(level) }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to delete fill config", validationErrors: [] } },
      { status: 500 },
    )
  }
}
