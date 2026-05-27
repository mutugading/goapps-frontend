/* eslint-disable @typescript-eslint/no-explicit-any */
// Finance RM Cost - list distinct periods that have RM cost records.

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

export async function GET(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()
    const response = await client.listRMCostPeriods({}, metadata)

    return NextResponse.json({
      base: serializeBase(response.base),
      periods: response.periods || [],
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error fetching RM Cost periods:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to fetch RM cost periods", validationErrors: [] },
        periods: [],
      },
      { status: 500 }
    )
  }
}
