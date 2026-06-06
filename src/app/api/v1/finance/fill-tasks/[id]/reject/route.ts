// Reject a fill task — sends it back to the filler with a reason.
import { NextRequest, NextResponse } from "next/server"
import { getFillTaskClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getFillTaskClient()
    const response = await client.rejectFillTask(
      {
        taskId: Number(id),
        reason: body.reason ?? "",
      },
      metadata,
    )
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to reject fill task", validationErrors: [] } },
      { status: 500 },
    )
  }
}
