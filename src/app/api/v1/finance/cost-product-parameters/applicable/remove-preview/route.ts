import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError, getCostProductParameterClient } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductParameterClient()
    const response = await client.getRemoveApplicablePreview(
      {
        productSysId: Number(body.productSysId ?? 0),
        paramId: body.paramId ?? "",
      },
      metadata,
    )
    return NextResponse.json({
      base: response.base,
      data: {
        triggerParamCode: response.triggerParamCode,
        triggerParamName: response.triggerParamName,
        children: response.children.map((c) => ({
          paramCode: c.paramCode,
          paramName: c.paramName,
          currentValue: c.currentValue,
        })),
      },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed", validationErrors: [] } },
      { status: 500 },
    )
  }
}
