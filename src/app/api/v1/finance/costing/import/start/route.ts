// POST /api/v1/finance/costing/import/start
// Starts an async ETL import job for an already-uploaded object (from the
// presigned upload). Accepts JSON body:
//   { kind: "product_routing" | "params_only", objectKey: string, fileName?: string }

import { NextRequest, NextResponse } from "next/server"
import {
  getCostDataImportClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"
import { ImportKind } from "@/types/generated/finance/v1/cost_import"

function toImportKind(kind: string): ImportKind {
  if (kind === "product_routing") return ImportKind.IMPORT_KIND_PRODUCT_ROUTING
  if (kind === "params_only") return ImportKind.IMPORT_KIND_PARAMS_ONLY
  return ImportKind.IMPORT_KIND_UNSPECIFIED
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)

    const res = await getCostDataImportClient().startCostingImport(
      {
        kind: toImportKind(body.kind),
        objectKey: body.objectKey ?? "",
        fileName: body.fileName ?? "",
        duplicateAction: body.duplicateAction ?? "",
      },
      metadata,
    )

    if (res.base && !res.base.isSuccess) {
      return NextResponse.json({ base: res.base }, { status: 422 })
    }

    return NextResponse.json({
      base: res.base,
      data: { jobId: res.jobId, status: res.status },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error starting costing import:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to start import",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
