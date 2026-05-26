import { NextRequest, NextResponse } from "next/server"
import { getCostRequestCommentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRequestCommentClient()
    const response = await client.updateCostRequestComment(
      {
        commentId: Number(commentId),
        bodyRichtext: body.bodyRichtext || body.body_richtext || "",
        bodyPlaintext: body.bodyPlaintext || body.body_plaintext || "",
        mentionedUserIds: body.mentionedUserIds || body.mentioned_user_ids || [],
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to update comment", validationErrors: [] } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostRequestCommentClient()
    const response = await client.deleteCostRequestComment({ commentId: Number(commentId) }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to delete comment", validationErrors: [] } }, { status: 500 })
  }
}
