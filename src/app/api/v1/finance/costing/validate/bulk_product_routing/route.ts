// POST /api/v1/finance/costing/validate/bulk_product_routing
// Validate a bulk product routing Excel file before importing.
// Accepts JSON body: { fileContent: number[], fileName: string }
// Returns: { isValid: boolean, sheets: BulkSheetValidationResult[] }

import { NextRequest, NextResponse } from "next/server"
import {
  getCostDataImportClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const fileContent = new Uint8Array(body.fileContent as number[])
    const fileName: string = body.fileName ?? ""

    const res = await getCostDataImportClient().validateBulkProductRoutingFile(
      { fileContent, fileName },
      metadata,
    )

    return NextResponse.json({
      isValid: res.isValid,
      sheets: res.sheets.map((sheet) => ({
        sheetName: sheet.sheetName,
        totalRows: sheet.totalRows,
        errorCount: sheet.errorCount,
        warningCount: sheet.warningCount,
        sampleErrors: sheet.sampleErrors.map((e) => ({
          rowNumber: e.rowNumber,
          field: e.field,
          message: e.message,
        })),
      })),
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error validating bulk product routing file:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to validate bulk product routing file",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
