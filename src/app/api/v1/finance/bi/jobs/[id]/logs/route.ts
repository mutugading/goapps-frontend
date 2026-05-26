// BI Jobs — paginated log list for one job.

import { NextRequest, NextResponse } from "next/server"
import { getBiJobClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiJobClient()
    const response = await client.listJobLogs(
      {
        jobId: id,
        page: Number(sp.get("page")) || 1,
        pageSize: Number(sp.get("pageSize")) || 20,
      },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data, pagination: response.pagination })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI job logs error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list job logs", validationErrors: [] }, data: [], pagination: { currentPage: 1, pageSize: 20, totalItems: 0, totalPages: 0 } },
      { status: 500 }
    )
  }
}
