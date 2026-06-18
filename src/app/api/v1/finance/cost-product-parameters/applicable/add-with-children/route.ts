import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError, getCostProductParameterClient } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductParameterClient()
    const response = await client.addApplicableParamWithChildren(
      {
        productSysId: Number(body.productSysId ?? 0),
        paramId: body.paramId ?? "",
        isRequired: !!body.isRequired,
        displayOrder: Number(body.displayOrder ?? 0),
      },
      metadata,
    )
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed", validationErrors: [] } },
      { status: 500 },
    )
  }
}
