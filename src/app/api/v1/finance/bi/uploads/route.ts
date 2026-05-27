// BI Upload — list recent uploads (paginated history).

import { NextRequest, NextResponse } from "next/server"
import { getBiUploadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const page = Number(sp.get("page")) || 1
    const pageSize = Number(sp.get("pageSize")) || 10
    const metadata = createMetadataFromRequest(request)
    const client = getBiUploadClient()
    const response = await client.listUploads({ page, pageSize }, metadata)
    return NextResponse.json({ base: response.base, data: response.data, pagination: response.pagination })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI uploads error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list uploads", validationErrors: [] }, data: [] },
      { status: 500 }
    )
  }
}
