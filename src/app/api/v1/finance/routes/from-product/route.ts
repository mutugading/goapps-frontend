import { NextRequest, NextResponse } from "next/server"

import { getCostRouteClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostRouteClient()
    const response = await client.createRouteFromProduct(
      {
        productSysId: Number(body.productSysId) || 0,
        linkedRequestId: Number(body.linkedRequestId) || 0,
        cylTypeId: Number(body.cylTypeId) || 0,
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, headId: String(response.headId ?? 0) })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to create route from product",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
