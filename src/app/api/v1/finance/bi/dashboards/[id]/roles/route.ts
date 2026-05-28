// BI Dashboards — overwrite role whitelist.

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.setDashboardRoles(
      { dashboardId: id, roleCodes: body.roleCodes ?? [] },
      metadata
    )
    return NextResponse.json({ base: response.base, roleCodes: response.roleCodes })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Set BI dashboard roles error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to set dashboard roles", validationErrors: [] } },
      { status: 500 }
    )
  }
}
