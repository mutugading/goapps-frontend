// BI Data Sources — registry list.

import { NextRequest, NextResponse } from "next/server"
import { getBiDataSourceClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiDataSourceClient()
    const response = await client.listDataSources(
      { includeInactive: sp.get("includeInactive") === "true" },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI data sources error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list data sources", validationErrors: [] }, data: [] },
      { status: 500 }
    )
  }
}
