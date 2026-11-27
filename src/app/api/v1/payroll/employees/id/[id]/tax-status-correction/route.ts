import { NextRequest } from "next/server"
import { badRequest, payrollProxy, pathInt } from "../../../../_lib/proxy"

type RouteContext = { params: Promise<{ id: string }> }

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "")

// POST /api/v1/payroll/employees/id/{id}/tax-status-correction (D-82 (5)/(6), T033n3)
// body: { taxId, validFrom (YYYY-MM-DD), reason, ifMatch }. Needs payroll.master.taxstatus.update (checked by the
// backend, 403 otherwise); the BFF only forwards. Business errors (PERIOD_CLOSED → 409, stale etag) come from gRPC.
export async function POST(request: NextRequest, context: RouteContext) {
  const id = pathInt((await context.params).id)
  if (!id) return badRequest("Invalid employee id")
  const body = await request.json().catch(() => ({}))
  const taxId = str(body?.taxId)
  const validFrom = str(body?.validFrom)
  const reason = str(body?.reason)
  const ifMatch = str(body?.ifMatch)
  if (!taxId) return badRequest("Tax status is required")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validFrom)) return badRequest("validFrom must be YYYY-MM-DD")
  if (!reason) return badRequest("Reason is required")
  if (!ifMatch) return badRequest("ifMatch is required")
  return payrollProxy(request, "Failed to correct tax status", (c, m) =>
    c.correctEmployeeTaxStatus({ id, taxId, validFrom, reason, ifMatch }, m)
  )
}
