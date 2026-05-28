// BI Dashboards — chart data for the viewer page.

import { NextRequest, NextResponse } from "next/server"
import { getBiChartDataClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { CompareMode } from "@/types/generated/finance/v1/bi"

function compareKeyToEnum(s: string | null): CompareMode {
  switch (s) {
    case "MoM": return CompareMode.COMPARE_MODE_MOM
    case "QoQ": return CompareMode.COMPARE_MODE_QOQ
    case "YoY": return CompareMode.COMPARE_MODE_YOY
    case "YTD": return CompareMode.COMPARE_MODE_YTD
    case "R12": return CompareMode.COMPARE_MODE_R12
    case "NONE":
    case "none":
    case null:
    case undefined:
      return CompareMode.COMPARE_MODE_NONE
    default:
      return CompareMode.COMPARE_MODE_UNSPECIFIED
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiChartDataClient()

    const drillPath = sp.get("drill_path")
    const periodFromStr = sp.get("periodFrom")
    const periodToStr = sp.get("periodTo")

    // Forward filter-chip selections as gRPC metadata headers so the backend can
    // add WHERE group_1/group_2 IN (...) without proto changes.
    const group1Filter = sp.get("group1_filter")?.split(",").filter(Boolean) ?? []
    const group2Filter = sp.get("group2_filter")?.split(",").filter(Boolean) ?? []
    if (group1Filter.length > 0) metadata.set("x-group1-filter", group1Filter.join(","))
    if (group2Filter.length > 0) metadata.set("x-group2-filter", group2Filter.join(","))

    const response = await client.getDashboardData(
      {
        dashboardCode: code,
        periodPreset: sp.get("period") || sp.get("periodPreset") || "L12M",
        periodFrom: periodFromStr ? new Date(periodFromStr) : undefined,
        periodTo: periodToStr ? new Date(periodToStr) : undefined,
        compare: compareKeyToEnum(sp.get("compare")),
        drillPath: drillPath ? drillPath.split(",").filter(Boolean) : [],
      },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Get BI chart data error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to load chart data", validationErrors: [] } },
      { status: 500 }
    )
  }
}
