import ExcelJS from "exceljs"
import { NextResponse } from "next/server"

// Column definitions match EXACTLY what the backend import handler reads.
// See: services/finance/internal/application/costbulkimport/sheet_*.go
//
// Sheet name rules:
//   - Prefixed names like "1_product_master" are accepted (fuzzy match)
//   - Split part-sheets like "product_parameters_p1" + "_p2" are merged automatically
//   - param sheets (product_parameters, product_applicable_params) are OPTIONAL
//     — a file with only product_master + routing sheets imports cleanly
//
// Cross-sheet FK key: legacy_oracle_sys_id
//   = cpm_flex_02 (Oracle integer sys_id) when set, else cpm_product_code
//   Every sheet uses the same value to reference the same product.
//
// route_head_legacy_product_id (routing sheets)
//   = the legacy_oracle_sys_id of the FG product that OWNS this route
//
// node_product_legacy_id (route_sequences)
//   = legacy_oracle_sys_id of the intermediate/FG product at that DAG node
//
// rm_product_legacy_id (route_rms, rm_type=PRODUCT only)
//   = legacy_oracle_sys_id of an upstream product used as RM input
//   DIFFERENT from route_head_legacy_product_id — this is the RM product, not the head

const SHEETS: { name: string; headers: string[]; sample: string[] }[] = [
  {
    name: "product_master",
    headers: [
      "legacy_oracle_sys_id",      // Oracle integer sys_id (or product_code as fallback)
      "product_type_code",          // must exist in Finance > Master > Product Type
      "product_name",
      "shade_code",
      "shade_name",
      "grade_code",
      "description",
      "erp_item_code",              // optional ERP item code reference
      "legacy_erp_compound_key",    // stored as flex_01 — optional legacy identifier
      "legacy_type_label",          // stored as flex_03 — optional legacy type label
      "is_active",                  // true / false
    ],
    sample: [
      "2512",
      "FINISH",
      "Sample Product Name",
      "NL",
      "NATURAL",
      "AX",
      "",
      "",
      "",
      "",
      "true",
    ],
  },
  {
    name: "product_parameters",
    headers: [
      "legacy_oracle_sys_id",
      "param_code",                 // must exist in Finance > Master > Parameter
      "data_type",                  // NUMERIC | TEXT | FLAG
      "value_numeric",              // fill when data_type = NUMERIC
      "value_text",                 // fill when data_type = TEXT
      "value_flag",                 // fill when data_type = FLAG (true/false)
    ],
    sample: ["2512", "PARAM_CODE", "NUMERIC", "100.5", "", ""],
  },
  {
    name: "product_applicable_params",
    headers: [
      "legacy_oracle_sys_id",
      "param_code",                 // must exist in Finance > Master > Parameter
      "is_required",                // true / false
      "display_order",              // integer, 0 = inherit default
    ],
    sample: ["2512", "PARAM_CODE", "true", "1"],
  },
  {
    name: "route_head",
    headers: [
      "legacy_oracle_sys_id",       // product that owns this route
      "routing_status",             // DRAFT (always DRAFT for new imports)
      "notes",
    ],
    sample: ["2512", "DRAFT", "Imported from Oracle"],
  },
  {
    name: "route_sequences",
    headers: [
      "route_head_legacy_product_id",  // = legacy_oracle_sys_id of the FG product (head)
      "node_product_legacy_id",        // = legacy_oracle_sys_id of the product at this node
      "route_level",                   // positive integer, 1 = FG level
      "route_seq",                     // sequence within a level, 1-based
      "route_name",                    // optional: e.g. "POY 380/144/TBL/DBR/SIM/NS/1/O"
      "route_item_code",               // optional: Oracle item code for this stage
      "route_shade_code",              // optional: shade code for this stage
      "route_shade_name",              // optional: shade name for this stage
    ],
    sample: ["2512", "2512", "1", "1", "", "", "", ""],
  },
  {
    name: "route_rms",
    headers: [
      "route_head_legacy_product_id",  // = legacy_oracle_sys_id of the FG product (head)
      "route_level",                   // must match a row in route_sequences
      "route_seq",                     // must match a row in route_sequences
      "rm_type",                       // PRODUCT | GROUP
      "ratio",                         // numeric, e.g. 1.0
      "rm_product_legacy_id",          // for rm_type=PRODUCT: legacy_oracle_sys_id of upstream product
      "rm_item_code",                  // for rm_type=ITEM (legacy, leave empty)
      "rm_group_code",                 // for rm_type=GROUP: RM group code from Finance > Master > RM Groups
      "rm_name",                       // optional display name
      "rm_shade_code",                 // optional
      "rm_shade_name",                 // optional
      "sub_type",                      // optional: e.g. WARP / WEFT
      "notes",                         // optional
    ],
    sample: ["2512", "1", "1", "GROUP", "1.0", "", "", "MY_GROUP_CODE", "", "", "", "", ""],
  },
]

export async function GET() {
  const wb = new ExcelJS.Workbook()

  for (const sheet of SHEETS) {
    const ws = wb.addWorksheet(sheet.name)

    ws.columns = sheet.headers.map((h) => ({
      header: h,
      key: h,
      width: Math.max(h.length + 4, 16),
    }))

    ws.addRow(sheet.sample)

    // Bold + light grey header row
    const headerRow = ws.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8E8E8" },
    }
    headerRow.commit()
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="bulk_product_routing_template.xlsx"',
    },
  })
}
