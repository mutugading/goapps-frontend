import { NextRequest, NextResponse } from "next/server"
import { getCostAttachmentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  try {
    const { attachmentId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostAttachmentClient()
    const response = await client.deleteCostAttachment({ attachmentId: Number(attachmentId) }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to delete attachment", validationErrors: [] } }, { status: 500 })
  }
}
