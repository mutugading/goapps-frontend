// BI Upload — cancel a previewed upload (discards staged rows).

import { NextRequest, NextResponse } from "next/server"
import { getBiUploadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getBiUploadClient()
    const response = await client.cancelUpload({ uploadId: id }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Cancel BI upload error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to cancel upload", validationErrors: [] } },
      { status: 500 }
    )
  }
}
