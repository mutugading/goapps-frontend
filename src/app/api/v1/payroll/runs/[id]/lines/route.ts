import { NextRequest } from "next/server"
import { badRequest, payrollProxy, pathInt, qInt, qStr } from "../../../_lib/proxy"

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/v1/payroll/runs/{id}/lines?nik=&page=&pageSize=
export async function GET(request: NextRequest, context: RouteContext) {
  const runId = pathInt((await context.params).id)
  if (!runId) return badRequest("Invalid run id")
  const sp = new URL(request.url).searchParams
  return payrollProxy(request, "Failed to list payroll run lines", (c, m) =>
    c.listRunLines(
      { runId, nik: qStr(sp, "nik"), page: qInt(sp, "page", 0), pageSize: qInt(sp, "pageSize", 0, "page_size") },
      m
    )
  )
}
