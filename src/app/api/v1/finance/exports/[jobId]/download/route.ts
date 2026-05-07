// GET /api/v1/finance/exports/{jobId}/download — redirect to a presigned MinIO URL.
//
// Calls finance gRPC GetExportDownloadURL which:
//   1. Verifies the caller owns the export job (job_execution.created_by).
//   2. Verifies the job is COMPLETED.
//   3. Generates a 5-minute presigned MinIO URL with download filename.
//
// Returns 302 redirect on success so the browser downloads the file.

import { NextRequest, NextResponse } from "next/server"
import { getRmCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type Ctx = { params: Promise<{ jobId: string }> }

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { jobId } = await ctx.params
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const response = await client.getExportDownloadURL({ jobId }, metadata)
    if (response.base?.isSuccess === false) {
      return NextResponse.json(
        { base: response.base },
        { status: Number(response.base?.statusCode ?? "400") || 400 },
      )
    }
    const url = response.data?.url ?? ""
    if (!url) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "404", message: "Download URL unavailable", validationErrors: [] } },
        { status: 404 },
      )
    }
    return NextResponse.redirect(url, { status: 302 })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching export download URL:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to resolve download URL", validationErrors: [] } },
      { status: 500 },
    )
  }
}
