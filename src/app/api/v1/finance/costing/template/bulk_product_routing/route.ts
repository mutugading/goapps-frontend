import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

const SHEETS: { name: string; headers: string[]; sample: string[] }[] = [
  {
    name: "product_master",
    headers: [
      "legacy_oracle_sys_id",
      "product_type_code",
      "product_name",
      "shade_code",
      "shade_name",
      "grade_code",
      "description",
      "erp_item_code",
      "flex_01",
      "flex_03",
      "is_active",
    ],
    sample: [
      "PROD-001",
      "FINISH",
      "Sample Product Name",
      "SH-001",
      "Shade Red",
      "A",
      "Sample description",
      "ERP-001",
      "",
      "",
      "true",
    ],
  },
  {
    name: "cpp",
    headers: [
      "legacy_oracle_sys_id",
      "param_code",
      "value_numeric",
      "value_text",
      "value_flag",
    ],
    sample: ["PROD-001", "PARAM_CODE", "100.5", "", ""],
  },
  {
    name: "capp",
    headers: [
      "legacy_oracle_sys_id",
      "param_code",
      "is_required",
      "display_order",
    ],
    sample: ["PROD-001", "PARAM_CODE", "true", "1"],
  },
  {
    name: "route_head",
    headers: ["legacy_oracle_sys_id", "notes"],
    sample: ["PROD-001", "Main routing"],
  },
  {
    name: "route_seq",
    headers: [
      "legacy_oracle_sys_id",
      "route_level",
      "route_seq",
      "route_name",
      "route_item_code",
      "position_x",
      "position_y",
      "cyl_type_id",
    ],
    sample: ["PROD-001", "1", "1", "Process 1", "SEQ-001", "0", "0", ""],
  },
  {
    name: "route_rm",
    headers: [
      "legacy_oracle_sys_id",
      "route_level",
      "route_seq",
      "rm_type",
      "rm_product_legacy_id",
      "rm_item_code",
      "rm_group_code",
      "rm_name",
      "rm_item_code_ref",
      "ratio",
      "sub_type",
      "notes",
    ],
    sample: [
      "PROD-001",
      "1",
      "1",
      "PRODUCT",
      "RM-001",
      "",
      "",
      "RM Name",
      "",
      "1.0",
      "",
      "",
    ],
  },
];

export async function GET() {
  const wb = new ExcelJS.Workbook();

  for (const sheet of SHEETS) {
    const ws = wb.addWorksheet(sheet.name);
    ws.addRow(sheet.headers);
    ws.addRow(sheet.sample);

    // Bold header row
    ws.getRow(1).font = { bold: true };
    // Auto-width columns
    ws.columns = sheet.headers.map((h, i) => ({
      header: h,
      key: String(i),
      width: Math.max(h.length + 4, 16),
    }));
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="bulk_product_routing_template.xlsx"',
    },
  });
}
