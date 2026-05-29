// BFF route: GET /api/v1/finance/bi/dashboards/by-code/[code]/computed
//
// Fetches a computed-ratio secondary chart payload. Passes a ComputedRatioConfig
// JSON blob to the backend via the x-computed-ratio gRPC metadata header so the
// query planner can execute planComputedRatio (group by group_2) instead of the
// standard multi-metric / MV path.
//
// Query params:
//   numerator   - metric_name for the dividend  (default: MARGIN)
//   denominator - metric_name for the divisor   (default: NETT_SALES)
//   scale       - multiplier for the ratio       (default: 100 → percent)
//   group_by    - grouping column                (default: group_2)
//   period      - period preset forwarded to the backend (default: L12M)

import { NextRequest, NextResponse } from "next/server"
import { getBiChartDataClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { CompareMode } from "@/types/generated/finance/v1/bi"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params
    const sp = request.nextUrl.searchParams

    const cr = {
      numerator: sp.get("numerator") ?? "MARGIN",
      denominator: sp.get("denominator") ?? "NETT_SALES",
      scale: parseFloat(sp.get("scale") ?? "100"),
      group_by: sp.get("group_by") ?? "group_2",
    }

    const metadata = createMetadataFromRequest(request)
    // Inject the computed-ratio config as a gRPC metadata header.
    // The backend's applyMetadataFilters() reads this and populates ViewerFilters.ComputedRatio,
    // which routes Plan() to planComputedRatio (CASE-WHEN pivot grouped by group_2).
    metadata.set("x-computed-ratio", JSON.stringify(cr))

    const client = getBiChartDataClient()
    const response = await client.getDashboardData(
      {
        dashboardCode: code,
        periodPreset: sp.get("period") ?? "L12M",
        periodFrom: undefined,
        periodTo: undefined,
        compare: CompareMode.COMPARE_MODE_NONE,
        drillPath: [],
      },
      metadata,
    )

    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Get BI computed ratio error:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to load computed chart data",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
