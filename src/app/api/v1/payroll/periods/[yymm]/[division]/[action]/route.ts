import { NextRequest } from "next/server"
import { badRequest, payrollProxy, pathInt } from "../../../../_lib/proxy"

type RouteContext = { params: Promise<{ yymm: string; division: string; action: string }> }

// POST /api/v1/payroll/periods/{yymm}/{division}/{approve|close|reopen}
// reopen body: { reason } (>= 10 characters, validated by the backend).
export async function POST(request: NextRequest, context: RouteContext) {
  const p = await context.params
  const yymm = pathInt(p.yymm)
  const division = decodeURIComponent(p.division)
  if (!yymm) return badRequest("Invalid yymm")
  if (!division) return badRequest("Division is required")

  switch (p.action) {
    case "approve":
      return payrollProxy(request, "Failed to approve payroll period", (c, m) =>
        c.approvePeriod({ yymm, division }, m)
      )
    case "close":
      return payrollProxy(request, "Failed to close payroll period", (c, m) =>
        c.closePeriod({ yymm, division }, m)
      )
    case "reopen": {
      const body = await request.json().catch(() => ({}))
      const reason = typeof body?.reason === "string" ? body.reason : ""
      return payrollProxy(request, "Failed to reopen payroll period", (c, m) =>
        c.reopenPeriod({ yymm, division, reason }, m)
      )
    }
    default:
      return badRequest("Unknown period action")
  }
}
