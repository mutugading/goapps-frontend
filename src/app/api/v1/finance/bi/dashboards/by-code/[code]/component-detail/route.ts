// BI Component Detail — fetches 3 periods (current, MoM, YoY) for a dashboard and
// returns per-category rows with absolute value and change columns.
// GET /api/v1/finance/bi/dashboards/by-code/[code]/component-detail
// Query: ?period=202604&group1=EBITDA
// Returns: { rows: [{category, current, mom, momDiff, momPct, yoy, yoyDiff, yoyPct}], period, momPeriod, yoyPeriod }

import { NextRequest, NextResponse } from "next/server"
import { getBiChartDataClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { CompareMode } from "@/types/generated/finance/v1/bi"
import type { Metadata } from "@grpc/grpc-js"

interface CategoryBucket {
  current?: number
  mom?: number
  yoy?: number
}

interface ComponentDetailRow {
  category: string
  current: number
  mom: number
  momDiff: number
  momPct: number
  yoy: number
  yoyDiff: number
  yoyPct: number
}

async function fetchPeriodPoints(
  client: ReturnType<typeof getBiChartDataClient>,
  code: string,
  yyyymm: string,
  metadata: Metadata,
): Promise<Array<{ category: string; value: number }>> {
  const periodFrom = new Date(`${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}-01`)
  // periodTo = same day (backend treats month range inclusively)
  const periodTo = new Date(`${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}-01`)
  const resp = await client.getDashboardData(
    {
      dashboardCode: code,
      periodPreset: "CUSTOM",
      periodFrom,
      periodTo,
      compare: CompareMode.COMPARE_MODE_NONE,
      drillPath: [],
    },
    metadata,
  )
  return (resp.data?.series?.[0]?.points ?? []).map((p) => ({ category: p.category, value: p.value }))
}

function momPeriod(period: string): string {
  const year = parseInt(period.slice(0, 4), 10)
  const month = parseInt(period.slice(4, 6), 10)
  const py = month === 1 ? year - 1 : year
  const pm = month === 1 ? 12 : month - 1
  return `${py}${String(pm).padStart(2, "0")}`
}

function yoyPeriod(period: string): string {
  return `${parseInt(period.slice(0, 4), 10) - 1}${period.slice(4, 6)}`
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    const sp = request.nextUrl.searchParams
    const period = sp.get("period") ?? ""

    if (!period || period.length !== 6 || !/^\d{6}$/.test(period)) {
      return NextResponse.json({ rows: [] })
    }

    const metadata = createMetadataFromRequest(request)
    const client = getBiChartDataClient()

    const mom = momPeriod(period)
    const yoy = yoyPeriod(period)

    const [curPts, momPts, yoyPts] = await Promise.all([
      fetchPeriodPoints(client, code, period, metadata),
      fetchPeriodPoints(client, code, mom, metadata),
      fetchPeriodPoints(client, code, yoy, metadata),
    ])

    const byCategory = new Map<string, CategoryBucket>()

    for (const pt of curPts) {
      byCategory.set(pt.category, { current: pt.value })
    }
    for (const pt of momPts) {
      const r = byCategory.get(pt.category) ?? {}
      r.mom = pt.value
      byCategory.set(pt.category, r)
    }
    for (const pt of yoyPts) {
      const r = byCategory.get(pt.category) ?? {}
      r.yoy = pt.value
      byCategory.set(pt.category, r)
    }

    const rows: ComponentDetailRow[] = Array.from(byCategory.entries()).map(([cat, v]) => {
      const cur = v.current ?? 0
      const momVal = v.mom ?? 0
      const yoyVal = v.yoy ?? 0
      const momDiff = cur - momVal
      const momPct = momVal !== 0 ? (momDiff / Math.abs(momVal)) * 100 : 0
      const yoyDiff = cur - yoyVal
      const yoyPct = yoyVal !== 0 ? (yoyDiff / Math.abs(yoyVal)) * 100 : 0
      return { category: cat, current: cur, mom: momVal, momDiff, momPct, yoy: yoyVal, yoyDiff, yoyPct }
    })

    return NextResponse.json({ rows, period, momPeriod: mom, yoyPeriod: yoy })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Component detail error:", error)
    return NextResponse.json({ rows: [], error: String(error) }, { status: 500 })
  }
}
