import { NextRequest, NextResponse } from "next/server"
import { getCostAttachmentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostAttachmentClient()
    const response = await client.listCostAttachmentsByComment({ commentId: Number(commentId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list attachments", validationErrors: [] }, data: [] }, { status: 500 })
  }
}
