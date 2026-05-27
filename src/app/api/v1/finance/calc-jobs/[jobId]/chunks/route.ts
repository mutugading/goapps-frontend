// CostCalc — list chunks for a job.
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { toChunkStatus } from "@/lib/grpc/cost-calc-enums"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.listCalcJobChunks(
      {
        jobId: Number(jobId),
        pagination: {
          page: Number(sp.get("page")) || 1,
          pageSize: Number(sp.get("pageSize")) || 20,
        },
        waveNo: Number(sp.get("waveNo")) || 0,
        status: toChunkStatus(sp.get("status")),
      },
      metadata,
    )
    return NextResponse.json({
      base: response.base,
      data: response.items,
      pagination: response.pagination
        ? {
            currentPage: response.pagination.currentPage,
            pageSize: response.pagination.pageSize,
            totalItems: String(response.pagination.totalItems ?? 0),
            totalPages: response.pagination.totalPages,
          }
        : undefined,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list chunks", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}
