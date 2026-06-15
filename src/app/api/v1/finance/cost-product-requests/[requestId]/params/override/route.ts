// POST — admin override of param values for one fill level of a CPR.
// Route is blocked when the linked route is locked (backend enforces this).
import { NextRequest, NextResponse } from "next/server"
import {
  getCostProductParameterClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

interface OverrideValueInput {
  productSysId: number
  paramId: string
  valueNumeric?: string
  valueText?: string
  valueFlag?: boolean
  hasValueFlag?: boolean
}

type RouteContext = { params: Promise<{ requestId: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { requestId } = await context.params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductParameterClient()

    const values = (body.values as OverrideValueInput[]).map((v) => ({
      productSysId: Number(v.productSysId),
      paramId: v.paramId,
      valueNumeric: v.valueNumeric ?? "",
      valueText: v.valueText ?? "",
      valueFlag: v.valueFlag ?? false,
      hasValueFlag: v.hasValueFlag ?? false,
    }))

    const response = await client.overrideParamValues(
      {
        requestId: Number(requestId),
        routeLevel: Number(body.routeLevel ?? 1),
        values,
      },
      metadata,
    )

    return NextResponse.json({
      base: response.base,
      updatedCount: response.updatedCount,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to override param values",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
