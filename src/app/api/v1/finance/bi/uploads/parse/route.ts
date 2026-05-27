// BI Upload — parse an uploaded .xlsx, validate rows, return a preview.
// Accepts multipart/form-data: { file: File, target_type: string }.

import { NextRequest, NextResponse } from "next/server"
import { getBiUploadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function errorResponse(status: number, message: string) {
  return NextResponse.json(
    { base: { isSuccess: false, statusCode: String(status), message, validationErrors: [] } },
    { status }
  )
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const targetType = String(form.get("target_type") ?? form.get("targetType") ?? "")
    const file = form.get("file")

    if (!targetType) return errorResponse(400, "Missing target type")
    if (!(file instanceof File)) return errorResponse(400, "Missing file")

    const lowerName = file.name.toLowerCase()
    if (!lowerName.endsWith(".xlsx")) {
      return errorResponse(400, "Only .xlsx files are supported")
    }
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(400, "File exceeds the 10MB limit")
    }

    const fileContent = new Uint8Array(await file.arrayBuffer())

    const metadata = createMetadataFromRequest(request)
    const client = getBiUploadClient()
    const response = await client.parseUpload(
      { targetType, fileName: file.name, fileContent },
      metadata
    )

    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Parse BI upload error:", error)
    return errorResponse(500, "Failed to parse upload")
  }
}
