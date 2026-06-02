// BI Monthly Detail — fetches L24M data for the primary dashboard and an optional
// compare dashboard, then returns the last 12 months with YoY and vs-compare columns.
// GET /api/v1/finance/bi/dashboards/by-code/[code]/monthly-detail
// Query: ?period=L12M&compare_code=EBITDA&metric_name=MARGIN
//
// metric_name (optional): when the primary dashboard is multi-metric (e.g. DELIVERY_MARGIN
// with MARGIN/NETT_SALES/GROSS_SALES), filter the series to the named metric before
// computing YoY. When omitted, the first series is used (single-metric dashboards).
//
// Returns: { rows: [{period, value, yoyValue, yoyDiff, yoyPct, vsCompare, vsComparePct}] }

import { NextRequest, NextResponse } from "next/server"
import { getBiChartDataClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { CompareMode } from "@/types/generated/finance/v1/bi"

interface MonthlyDetailRow {
  period: string
  value: number
  yoyValue: number | null
  yoyDiff: number | null
  yoyPct: number | null
  vsCompare: number | null
  vsComparePct: number | null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const sp = request.nextUrl.searchParams
    const compareCode = sp.get("compare_code")
    const metricName = sp.get("metric_name") ?? null
    const metadata = createMetadataFromRequest(request)
    const client = getBiChartDataClient()

    // Fetch L24M to have enough history for YoY on the most recent 12 months.
    const mainResp = await client.getDashboardData(
      {
        dashboardCode: code,
        periodPreset: "L24M",
        periodFrom: undefined,
        periodTo: undefined,
        compare: CompareMode.COMPARE_MODE_NONE,
        drillPath: [],
      },
      metadata,
    )

    // For multi-metric dashboards, find the series matching metricName.
    // Shape() maps raw metric codes (e.g. "MARGIN") to human-readable labels
    // (e.g. "Margin") via staticMetricLabels, so match case-insensitively and
    // also try the raw code directly before falling back to the first series.
    const allSeries = mainResp.data?.series ?? []
    const targetSeries = metricName
      ? (allSeries.find((s) => s.name.toLowerCase() === metricName.toLowerCase()) ??
         allSeries.find((s) => s.name === metricName) ??
         allSeries[0])
      : allSeries[0]

    const mainPoints = (targetSeries?.points ?? [])
      .map((p) => ({ category: p.category, value: p.value }))
      .filter((p) => /^\d{6}$/.test(p.category))

    // Sort ascending by YYYYMM so index arithmetic works.
    mainPoints.sort((a, b) => a.category.localeCompare(b.category))

    // Fetch compare dashboard L24M if requested.
    // x-force-trend forces isTrend=true server-side so categorical dashboards (e.g. EBITDA
    // waterfall with x_axis_field="group_2") return period-grouped time-series data instead
    // of their normal group_2 breakdown — which has no per-period points to compare against.
    const compareByPeriod = new Map<string, number>()
    if (compareCode) {
      const cmpMetadata = createMetadataFromRequest(request)
      cmpMetadata.add("x-force-trend", "true")
      const cmpResp = await client.getDashboardData(
        {
          dashboardCode: compareCode,
          periodPreset: "L24M",
          periodFrom: undefined,
          periodTo: undefined,
          compare: CompareMode.COMPARE_MODE_NONE,
          drillPath: [],
        },
        cmpMetadata,
      )
      for (const pt of cmpResp.data?.series?.[0]?.points ?? []) {
        if (/^\d{6}$/.test(pt.category)) {
          compareByPeriod.set(pt.category, pt.value)
        }
      }
    }

    // Take the last 12 months.
    const last12 = mainPoints.slice(-12)

    const rows: MonthlyDetailRow[] = last12.map((pt) => {
      const period = pt.category
      const value = pt.value

      // YoY: find same category - 12 months in the full sorted array.
      const fullIdx = mainPoints.findIndex((p) => p.category === period)
      const yoyIdx = fullIdx - 12
      const yoyValue = yoyIdx >= 0 ? mainPoints[yoyIdx].value : null
      const yoyDiff = yoyValue !== null ? value - yoyValue : null
      const yoyPct = yoyValue !== null && yoyValue !== 0 ? (yoyDiff! / Math.abs(yoyValue)) * 100 : null

      const vsCompare = compareByPeriod.has(period) ? (compareByPeriod.get(period) ?? null) : null
      const vsComparePct =
        vsCompare !== null && vsCompare !== 0 ? ((value - vsCompare) / Math.abs(vsCompare)) * 100 : null

      return { period, value, yoyValue, yoyDiff, yoyPct, vsCompare, vsComparePct }
    })

    return NextResponse.json({ rows })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Monthly detail error:", error)
    return NextResponse.json({ rows: [], error: String(error) }, { status: 500 })
  }
}
