// Approve a fill task — approver decision with optional note.
import { NextRequest, NextResponse } from "next/server"
import { getFillTaskClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getFillTaskClient()
    const response = await client.approveFillTask(
      {
        taskId: Number(id),
        requestId: Number(body.requestId ?? body.request_id ?? 0) || 0,
        note: body.note ?? "",
      },
      metadata,
    )
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to approve fill task", validationErrors: [] } },
      { status: 500 },
    )
  }
}
