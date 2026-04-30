/* eslint-disable @typescript-eslint/no-explicit-any */
// V2: UpdateCostDetailFixRate — edit one detail row's fix_rate inline.

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ costDetailId: string }> },
) {
  try {
    const { costDetailId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const response = await client.updateCostDetailFixRate(
      {
        costDetailId,
        fixRate: body.fixRate ?? undefined,
      },
      metadata,
    )

    return NextResponse.json({
      base: serializeBase(response.base),
      detail: response.detail || null,
      parentCost: response.parentCost || null,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error updating fix_rate:", error)
    return NextResponse.json(
      {
        base: { isSuccess: false, statusCode: "500", message: "Failed to update fix_rate", validationErrors: [] },
      },
      { status: 500 },
    )
  }
}
