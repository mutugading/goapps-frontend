// GET /api/v1/payroll/reports/export?kind=reco|bank&yymm=&division=&transferDate=YYYY-MM-DD (T030d2)
// Relays the xlsx bytes of ExportReport (T030d) as a download; Content-Disposition comes from file_name.
// Permission checks (report.data.view + salary.amount.view) are enforced by the backend.

import { NextRequest, NextResponse } from "next/server"
import { getPayrollClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { ReportKind } from "@/types/generated/payroll/v1/report"
import { badRequest, qInt, qStr } from "../../_lib/proxy"

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams
  const kindStr = qStr(sp, "kind").toLowerCase()
  const kind =
    kindStr === "reco" ? ReportKind.REPORT_KIND_RECO : kindStr === "bank" ? ReportKind.REPORT_KIND_BANK : undefined
  if (kind === undefined) return badRequest("kind must be reco or bank")
  const yymm = qInt(sp, "yymm")
  const division = qStr(sp, "division")
  if (!yymm || !division) return badRequest("yymm and division are required")
  const transferDate = qStr(sp, "transferDate", "transfer_date")
  if (kind === ReportKind.REPORT_KIND_BANK && !DATE_RE.test(transferDate)) {
    return badRequest("transferDate (YYYY-MM-DD) is required for bank")
  }

  try {
    const res = await getPayrollClient().exportReport(
      { yymm, division, kind, transferDate: kind === ReportKind.REPORT_KIND_BANK ? transferDate : "" },
      createMetadataFromRequest(request)
    )
    if (!res.base?.isSuccess) return NextResponse.json({ base: res.base }, { status: 400 })
    const fileName = (res.fileName || `${kindStr}_${division}_${yymm}.xlsx`).replace(/["\r\n\\]/g, "_")
    return new NextResponse(Buffer.from(res.fileContent), {
      headers: {
        "Content-Type": XLSX,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Row-Count": String(res.rowCount),
        "X-Skipped-Count": String(res.skippedCount),
      },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Failed to export payroll report", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to export payroll report", validationErrors: [] } },
      { status: 500 }
    )
  }
}
