import { NextRequest, NextResponse } from "next/server"
import { getCostAttachmentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostAttachmentClient()
    const response = await client.listCostAttachmentsByRequest({ requestId: Number(requestId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list attachments", validationErrors: [] }, data: [] }, { status: 500 })
  }
}
