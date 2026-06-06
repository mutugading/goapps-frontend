// Claim a fill task — assigns the authenticated user as the active filler.
import { NextRequest, NextResponse } from "next/server"
import { getFillTaskClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getFillTaskClient()
    const response = await client.claimFillTask({ taskId: Number(id) }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to claim fill task", validationErrors: [] } },
      { status: 500 },
    )
  }
}
