import { NextRequest } from "next/server"
import { badRequest, payrollProxy, pathInt } from "../../_lib/proxy"

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/v1/payroll/runs/{id}
export async function GET(request: NextRequest, context: RouteContext) {
  const runId = pathInt((await context.params).id)
  if (!runId) return badRequest("Invalid run id")
  return payrollProxy(request, "Failed to get payroll run", (c, m) => c.getRun({ runId }, m))
}
