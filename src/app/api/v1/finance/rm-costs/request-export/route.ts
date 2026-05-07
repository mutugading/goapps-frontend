// POST /api/v1/finance/rm-costs/request-export — queue an async RM cost export job.

import { NextRequest, NextResponse } from "next/server"
import { getRmCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getRmCostClient()

    const response = await client.requestRMCostExport(
      {
        period: body.period ?? "",
        rmType: Number(body.rmType ?? body.rm_type ?? 0),
        groupHeadId: body.groupHeadId ?? body.group_head_id ?? undefined,
        search: body.search ?? "",
      },
      metadata,
    )

    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error queuing RM Cost export:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to queue export", validationErrors: [] } },
      { status: 500 },
    )
  }
}
