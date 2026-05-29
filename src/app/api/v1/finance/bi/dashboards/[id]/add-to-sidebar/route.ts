// POST /api/v1/finance/bi/dashboards/[id]/add-to-sidebar
// Creates an IAM menu entry for the given BI dashboard under BI_PARENT.

import { NextRequest, NextResponse } from "next/server"
import {
  getBiDashboardClient,
  getMenuClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

// BI_PARENT level-2 menu UUID (seeded by IAM migration 000044).
const BI_PARENT_ID = "00000000-0000-0000-0002-000000000020"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = (await request.json()) as {
      menuTitle?: string
      menuIcon?: string
      sortOrder?: number
    }
    const { menuTitle, menuIcon = "BarChart2", sortOrder = 50 } = body

    const metadata = createMetadataFromRequest(request)

    // Fetch dashboard to get dashboardCode and dashboardTitle.
    const dashClient = getBiDashboardClient()
    const dashResp = await dashClient.getDashboard({ dashboardId: id }, metadata)
    if (!dashResp.data) {
      return NextResponse.json(
        {
          base: {
            isSuccess: false,
            statusCode: "404",
            message: "Dashboard not found",
            validationErrors: [],
          },
        },
        { status: 404 },
      )
    }

    const dashboard = dashResp.data
    const resolvedTitle = menuTitle || dashboard.dashboardTitle || dashboard.dashboardCode
    const menuUrl = `/finance/bi/${dashboard.dashboardCode}`
    const menuCode = `BI_${dashboard.dashboardCode}`

    // Create the IAM menu entry under BI_PARENT.
    const menuClient = getMenuClient()
    const menuResp = await menuClient.createMenu(
      {
        parentId: BI_PARENT_ID,
        menuCode,
        menuTitle: resolvedTitle,
        menuUrl,
        iconName: menuIcon,
        serviceName: "finance",
        menuLevel: 3,
        sortOrder,
        isVisible: true,
        permissionIds: [],
      },
      metadata,
    )

    return NextResponse.json({ base: menuResp.base, data: menuResp.data }, { status: 201 })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Add to sidebar error:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to add dashboard to sidebar",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
