import { NextRequest } from "next/server"
import { badRequest, payrollProxy, qInt, qStr } from "../../_lib/proxy"

type RouteContext = { params: Promise<{ nik: string }> }

// GET /api/v1/payroll/employees/{nik}?companyId=&division=
// NIK may be old or new (13 §3.1); an ambiguous NIK needs `division`.
export async function GET(request: NextRequest, context: RouteContext) {
  const nik = decodeURIComponent((await context.params).nik).trim()
  if (!nik) return badRequest("NIK is required")
  const sp = request.nextUrl.searchParams
  return payrollProxy(request, "Failed to get payroll employee", (c, m) =>
    c.getEmployee({ nik, companyId: qInt(sp, "companyId", 0, "company_id"), division: qStr(sp, "division") }, m)
  )
}
