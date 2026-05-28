// BI Dashboards — get by business code.

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.getDashboardByCode({ dashboardCode: code }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Get BI dashboard by code error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get dashboard", validationErrors: [] } },
      { status: 500 }
    )
  }
}
