// BI Upload — commit a previewed upload (writes staged rows into the fact table).

import { NextRequest, NextResponse } from "next/server"
import { getBiUploadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getBiUploadClient()
    const response = await client.commitUpload({ uploadId: id }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Commit BI upload error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to commit upload", validationErrors: [] } },
      { status: 500 }
    )
  }
}
