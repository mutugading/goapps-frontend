// BI preview — admin live preview of an unsaved dashboard config.

import { NextRequest, NextResponse } from "next/server"
import { getBiChartDataClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiChartDataClient()
    const response = await client.previewDashboard(body, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Preview BI dashboard error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to render preview", validationErrors: [] } },
      { status: 500 }
    )
  }
}
