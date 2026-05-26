// CostCalc — full cost breakdown for product/period/calc-type.
import { NextRequest, NextResponse } from "next/server"
import { getCostCalcClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { toCalcType } from "@/lib/grpc/cost-calc-enums"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productSysId: string; period: string; calcType: string }> },
) {
  try {
    const { productSysId, period, calcType } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getCostCalcClient()
    const response = await client.getCostBreakdown(
      {
        productSysId: Number(productSysId),
        period: String(period),
        calculationType: toCalcType(calcType),
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.breakdown })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get cost breakdown", validationErrors: [] } },
      { status: 500 },
    )
  }
}
