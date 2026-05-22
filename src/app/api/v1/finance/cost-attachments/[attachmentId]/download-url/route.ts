import { NextRequest, NextResponse } from "next/server"
import { getCostAttachmentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  try {
    const { attachmentId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostAttachmentClient()
    const response = await client.getCostAttachmentDownloadURL({ attachmentId: Number(attachmentId) }, metadata)
    return NextResponse.json({
      base: response.base,
      url: response.url,
      validSeconds: response.validSeconds,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to fetch download URL", validationErrors: [] } }, { status: 500 })
  }
}
