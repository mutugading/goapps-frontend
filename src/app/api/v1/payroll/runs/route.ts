import { NextRequest } from "next/server"
import { RunMode } from "@/types/generated/payroll/v1/run"
import { badRequest, payrollProxy, qInt, qStr } from "../_lib/proxy"

// GET /api/v1/payroll/runs?yymm=&division=
export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams
  return payrollProxy(request, "Failed to list payroll runs", (c, m) =>
    c.listRuns({ yymm: qInt(sp, "yymm", 0), division: qStr(sp, "division") }, m)
  )
}

const MAX_NIK = 500

/**
 * POST /api/v1/payroll/runs  body: { yymm, division, nik?: string[] } (T031b, D-71 (1)(2)).
 * Dry run only: the BFF forces mode=DRY and companyId=0 (backend derives the company from the caller scope, D-71 (3)).
 * mode / companyId / processDate sent by the client are ignored, so a commit cannot go through the BFF.
 */
export async function POST(request: NextRequest) {
  let body: { yymm?: unknown; division?: unknown; nik?: unknown }
  try {
    body = await request.json()
  } catch {
    return badRequest("Invalid JSON body")
  }
  const yymm = Number(body?.yymm)
  const division = typeof body?.division === "string" ? body.division.trim() : ""
  if (!Number.isInteger(yymm) || yymm < 190001 || yymm > 999912) return badRequest("yymm must be YYYYMM")
  if (!division) return badRequest("division is required")
  let nik: string[] = []
  if (body?.nik !== undefined && body.nik !== null) {
    if (!Array.isArray(body.nik) || body.nik.some((n) => typeof n !== "string")) {
      return badRequest("nik must be an array of strings")
    }
    nik = (body.nik as string[]).map((n) => n.trim()).filter(Boolean)
    if (nik.length > MAX_NIK) return badRequest(`nik allows at most ${MAX_NIK} items`)
  }
  return payrollProxy(request, "Failed to run payroll dry run", (c, m) =>
    c.createRun({ yymm, division, companyId: 0, processDate: "", mode: RunMode.RUN_MODE_DRY, nik }, m)
  )
}
