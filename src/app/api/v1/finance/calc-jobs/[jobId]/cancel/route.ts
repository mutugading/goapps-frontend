// CostCalc — cancel job.
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params
    const body = await request.json().catch(() => ({}))
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.cancelCalcJob(
      { jobId: Number(jobId), reason: String(body?.reason || "") },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.job })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to cancel calc job", validationErrors: [] } },
      { status: 500 },
    )
  }
}
