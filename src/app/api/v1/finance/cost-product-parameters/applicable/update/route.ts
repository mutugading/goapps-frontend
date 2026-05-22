import { NextRequest, NextResponse } from "next/server"
import { getCostProductParameterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductParameterClient()
    const payload: Record<string, unknown> = {
      productSysId: Number(body.productSysId ?? 0),
      paramId: body.paramId ?? "",
    }
    if (typeof body.isRequired === "boolean") payload.isRequired = body.isRequired
    if (typeof body.displayOrder === "number") payload.displayOrder = body.displayOrder
    const response = await client.updateApplicableParam(payload as never, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed", validationErrors: [] } },
      { status: 500 },
    )
  }
}
