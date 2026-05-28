// BI Dashboards — duplicate (clone with new code/title).

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.duplicateDashboard({ ...body, dashboardId: id }, metadata)
    return NextResponse.json({ base: response.base, data: response.data }, { status: 201 })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Duplicate BI dashboard error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to duplicate dashboard", validationErrors: [] } },
      { status: 500 }
    )
  }
}
