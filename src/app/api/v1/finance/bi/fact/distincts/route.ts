// BI Fact Distincts — powers admin form dropdowns.

import { NextRequest, NextResponse } from "next/server"
import { getBiDataSourceClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiDataSourceClient()
    const response = await client.getFactDistincts({ type: sp.get("type") || "" }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Get BI fact distincts error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get distinct values", validationErrors: [] } },
      { status: 500 }
    )
  }
}
