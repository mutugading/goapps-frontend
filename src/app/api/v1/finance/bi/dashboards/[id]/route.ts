// BI Dashboards — get by ID, update, soft-delete.

import { NextRequest, NextResponse } from "next/server"
import { getBiDashboardClient, getMenuClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { MenuLevel } from "@/types/generated/iam/v1/menu"
import { ActiveFilter } from "@/types/generated/iam/v1/user"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.getDashboard({ dashboardId: id }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Get BI dashboard error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to get dashboard", validationErrors: [] } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()
    const response = await client.updateDashboard({ ...body, dashboardId: id }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Update BI dashboard error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to update dashboard", validationErrors: [] } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(request)
    const client = getBiDashboardClient()

    // Fetch dashboard code before deleting (needed to find & remove IAM sidebar entry).
    let dashboardCode: string | undefined
    try {
      const dashResp = await client.getDashboard({ dashboardId: id }, metadata)
      dashboardCode = dashResp.data?.dashboardCode
    } catch {
      // Non-fatal — proceed with delete even if we can't fetch the code.
    }

    const response = await client.deleteDashboard({ dashboardId: id }, metadata)

    // Best-effort: remove the associated IAM sidebar menu entry (code=BI_<DASHBOARD_CODE>).
    if (dashboardCode) {
      try {
        const menuCode = `BI_${dashboardCode}`
        const menuClient = getMenuClient()
        // Search for the menu by code (use search field with exact code).
        const listResp = await menuClient.listMenus(
          {
            page: 1,
            pageSize: 5,
            search: menuCode,
            activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
            serviceName: "finance",
            menuLevel: MenuLevel.MENU_LEVEL_UNSPECIFIED,
            sortBy: "",
            sortOrder: "",
          },
          metadata,
        )
        const match = (listResp.data ?? []).find((m) => m.menuCode === menuCode)
        if (match?.menuId) {
          await menuClient.deleteMenu({ menuId: match.menuId, cascade: false }, metadata)
        }
      } catch {
        // Best-effort — sidebar menu cleanup failure never blocks dashboard delete.
      }
    }

    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Delete BI dashboard error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to delete dashboard", validationErrors: [] } },
      { status: 500 }
    )
  }
}
