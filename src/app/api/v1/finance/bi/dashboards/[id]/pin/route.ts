// BI Dashboards — pin a dashboard to the Executive Dashboard landing page.

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.updateDashboard(
      { dashboardId: id, isFeatured: true, chartConfig: undefined, layoutConfig: undefined, kpiConfig: undefined, compareModes: [] },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Pin BI dashboard error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to pin dashboard", validationErrors: [] } },
      { status: 500 }
    )
  }
}
