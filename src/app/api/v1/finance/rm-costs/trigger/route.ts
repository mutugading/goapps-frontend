/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Cost - trigger async calculation job

import { NextRequest, NextResponse } from "next/server"
import { getRmCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

function serializeBase(base: any) {
  return base
    ? {
        isSuccess: base.isSuccess ?? false,
        statusCode: base.statusCode || "200",
        message: base.message || "",
        validationErrors: base.validationErrors || [],
      }
    : { isSuccess: true, statusCode: "200", message: "OK", validationErrors: [] }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const response = await client.triggerRMCostCalculation(
      {
        period: body.period,
        groupHeadId: body.groupHeadId || undefined,
        triggerReason: Number(body.triggerReason) || 4, // default MANUAL_UI
      },
      metadata
    )

    return NextResponse.json({
      base: serializeBase(response.base),
      jobId: response.jobId || "",
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error triggering RM Cost calculation:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to trigger calculation", validationErrors: [] },
      },
      { status: 500 }
    )
  }
}
