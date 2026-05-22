// CostCalc — get single job.
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.getCalcJob({ jobId: Number(jobId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.job })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get calc job", validationErrors: [] } },
      { status: 500 },
    )
  }
}
