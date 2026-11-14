import { NextRequest } from "next/server"
import { payrollProxy, qStr } from "../_lib/proxy"

// GET /api/v1/payroll/periods?division=
export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams
  return payrollProxy(request, "Failed to list payroll periods", (c, m) =>
    c.listPeriods({ division: qStr(sp, "division") }, m)
  )
}
