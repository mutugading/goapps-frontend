import { NextRequest, NextResponse } from "next/server"
import { getCostRequestCommentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRequestCommentClient()
    const response = await client.hideCostRequestComment(
      { commentId: Number(commentId), hiddenReason: body.hiddenReason || body.hidden_reason || "" },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to hide comment", validationErrors: [] } }, { status: 500 })
  }
}
