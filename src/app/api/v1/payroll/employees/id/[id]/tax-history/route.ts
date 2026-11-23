import { NextRequest } from "next/server"
import { badRequest, payrollProxy, pathInt } from "../../../../_lib/proxy"

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/v1/payroll/employees/id/{id}/tax-history (D-82 (1), T033n4)
// Tax-status history of one employee, newest first. The backend checks payroll.master.employee.view and the RLS
// scope (an employee outside the scope is 404); the BFF only forwards.
export async function GET(request: NextRequest, context: RouteContext) {
  const id = pathInt((await context.params).id)
  if (!id) return badRequest("Invalid employee id")
  return payrollProxy(request, "Failed to list tax-status history", (c, m) => c.listEmployeeTaxHistory({ id }, m))
}
