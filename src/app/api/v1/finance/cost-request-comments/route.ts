// Create comment.
import { NextRequest, NextResponse } from "next/server"
import { getCostRequestCommentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRequestCommentClient()
    const response = await client.createCostRequestComment(
      {
        requestId: Number(body.requestId || body.request_id) || 0,
        parentCommentId: Number(body.parentCommentId || body.parent_comment_id) || 0,
        bodyRichtext: body.bodyRichtext || body.body_richtext || "",
        bodyPlaintext: body.bodyPlaintext || body.body_plaintext || "",
        mentionedUserIds: body.mentionedUserIds || body.mentioned_user_ids || [],
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to create comment", validationErrors: [] } }, { status: 500 })
  }
}
