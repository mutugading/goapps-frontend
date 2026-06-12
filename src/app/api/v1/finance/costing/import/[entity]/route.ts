// POST /api/v1/finance/costing/import/[entity] — import entity data from Excel
//
// Sync entities (product_type, parameter): return SyncImportResult directly.
// Async entities (product_master, capp, cpp): return { data: { jobId: number } }.
//
// Request body (JSON):
//   { fileContent: number[], fileName: string, duplicateAction: "skip" | "update" | "error" }

import { NextRequest, NextResponse } from "next/server"
import {
  getCostProductTypeClient,
  getParameterClient,
  getCostProductMasterClient,
  getCostDataImportClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

// Entities whose imports run synchronously and return row-level results.
const SYNC_ENTITIES = new Set(["product_type", "parameter"])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const fileContent = new Uint8Array(body.fileContent as number[])
    const fileName: string = body.fileName ?? ""
    const duplicateAction: string = body.duplicateAction ?? "skip"

    if (SYNC_ENTITIES.has(entity)) {
      // ── Synchronous import ──────────────────────────────────────────────
      switch (entity) {
        case "product_type": {
          const res = await getCostProductTypeClient().importCostProductTypes(
            { fileContent, fileName, duplicateAction },
            metadata,
          )
          return NextResponse.json({
            base: res.base,
            data: {
              successCount: res.successCount,
              skippedCount: res.skippedCount,
              updatedCount: res.updatedCount,
              failedCount: res.failedCount,
              errors: res.errors,
            },
          })
        }
        case "parameter": {
          const res = await getParameterClient().importParameters(
            { fileContent, fileName, duplicateAction },
            metadata,
          )
          return NextResponse.json({
            base: res.base,
            data: {
              successCount: res.successCount,
              skippedCount: res.skippedCount,
              updatedCount: res.updatedCount,
              failedCount: res.failedCount,
              errors: res.errors,
            },
          })
        }
      }
    }

    // ── Asynchronous import ───────────────────────────────────────────────
    switch (entity) {
      case "product_master": {
        const res = await getCostProductMasterClient().importCostProductMasters(
          { fileContent, fileName, duplicateAction },
          metadata,
        )
        return NextResponse.json({
          base: res.base,
          data: { jobId: res.jobId },
        })
      }
      case "capp": {
        const res = await getCostDataImportClient().importCostApplicableParams(
          { fileContent, fileName, duplicateAction },
          metadata,
        )
        return NextResponse.json({
          base: res.base,
          data: { jobId: res.jobId },
        })
      }
      case "cpp": {
        const res = await getCostDataImportClient().importCostProductParameters(
          { fileContent, fileName, duplicateAction },
          metadata,
        )
        return NextResponse.json({
          base: res.base,
          data: { jobId: res.jobId },
        })
      }
      default:
        return NextResponse.json(
          {
            base: {
              isSuccess: false,
              statusCode: "400",
              message: `Unknown entity: ${entity}`,
              validationErrors: [],
            },
          },
          { status: 400 },
        )
    }
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error(`Error importing ${entity}:`, error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to import data",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
