// BI Jobs — list ETL job registry.

import { NextRequest, NextResponse } from "next/server"
import { getBiJobClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiJobClient()
    const response = await client.listJobs(
      { includeInactive: sp.get("includeInactive") === "true" },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI jobs error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list jobs", validationErrors: [] }, data: [] },
      { status: 500 }
    )
  }
}
