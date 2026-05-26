import { NextRequest, NextResponse } from "next/server"
import { getCostRequestCommentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRequestCommentClient()
    const response = await client.unhideCostRequestComment({ commentId: Number(commentId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to unhide comment", validationErrors: [] } }, { status: 500 })
  }
}
