// Upload an attachment. Accepts multipart/form-data; the backend gRPC API takes
// raw bytes so we read the file into memory + forward.
import { NextRequest, NextResponse } from "next/server"
import { getCostAttachmentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "400", message: "Missing file", validationErrors: [] } },
        { status: 400 },
      )
    }
    const buf = Buffer.from(await file.arrayBuffer())
    const requestId = Number(formData.get("requestId") || formData.get("request_id")) || 0
    const commentId = Number(formData.get("commentId") || formData.get("comment_id")) || 0
    const filename = String(formData.get("filename") || file.name || "file")
    const mimeType = String(formData.get("mimeType") || file.type || "application/octet-stream")
    const metadata = createMetadataFromRequest(request)
    const client = getCostAttachmentClient()
    const response = await client.uploadCostAttachment(
      {
        requestId,
        commentId,
        filename,
        mimeType,
        fileContent: buf,
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to upload attachment", validationErrors: [] } }, { status: 500 })
  }
}
