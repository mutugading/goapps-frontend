// GET — override audit history for one fill level of a CPR.
import { NextRequest, NextResponse } from "next/server"
import {
  getCostProductParameterClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

type RouteContext = { params: Promise<{ requestId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { requestId } = await context.params
    const { searchParams } = new URL(request.url)
    const routeLevel = Number(searchParams.get("level") ?? "1")
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductParameterClient()

    const response = await client.listParamEditLog(
      { requestId: Number(requestId), routeLevel },
      metadata,
    )

    return NextResponse.json({
      base: response.base,
      entries: response.entries,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to load edit log",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
