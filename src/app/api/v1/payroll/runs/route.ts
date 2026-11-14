import { NextRequest } from "next/server"
import { payrollProxy, qInt, qStr } from "../_lib/proxy"

// GET /api/v1/payroll/runs?yymm=&division=
export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams
  return payrollProxy(request, "Failed to list payroll runs", (c, m) =>
    c.listRuns({ yymm: qInt(sp, "yymm", 0), division: qStr(sp, "division") }, m)
  )
}
