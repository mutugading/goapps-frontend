// CostCalc — verify a cost result.
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ costId: string }> }) {
  try {
    const { costId } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.verifyCostResult({ costId: Number(costId) }, metadata)
    return NextResponse.json({ base: response.base, data: response.result })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to verify cost result", validationErrors: [] } },
      { status: 500 },
    )
  }
}
