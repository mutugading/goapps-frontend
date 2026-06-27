// GET /api/v1/finance/costing/template/bulk_params_only
// Returns a 2-sheet Excel template: product_parameters + product_applicable_params.
// Use this when importing params separately from product master + routing.
// Supports split part-sheets (e.g. product_parameters_p1, _p2) on import.
import ExcelJS from "exceljs"
import { NextResponse } from "next/server"

const SHEETS: { name: string; headers: string[]; sample: string[] }[] = [
  {
    name: "product_parameters",
    headers: [
      "legacy_oracle_sys_id",
      "param_code",
      "data_type",
      "value_numeric",
      "value_text",
      "value_flag",
    ],
    sample: ["2512", "PARAM_CODE", "NUMERIC", "100.5", "", ""],
  },
  {
    name: "product_applicable_params",
    headers: ["legacy_oracle_sys_id", "param_code", "is_required", "display_order"],
    sample: ["2512", "PARAM_CODE", "true", "1"],
  },
]

export async function GET() {
  const wb = new ExcelJS.Workbook()

  for (const sheet of SHEETS) {
    const ws = wb.addWorksheet(sheet.name)
    ws.addRow(sheet.headers)
    ws.addRow(sheet.sample)

    // Bold header row
    const headerRow = ws.getRow(1)
    headerRow.font = { bold: true }
    headerRow.commit()

    // Auto-width columns
    sheet.headers.forEach((h, i) => {
      const col = ws.getColumn(i + 1)
      col.width = Math.max(h.length + 4, 14)
    })
  }

  const buffer = await wb.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="bulk_params_only_template.xlsx"',
    },
  })
}
