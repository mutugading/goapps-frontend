// POST /api/v1/finance/costing/import/upload-url
// Returns a presigned PUT URL so the browser can upload a bulk-import file
// (xlsx or zipped CSV) directly to object storage, bypassing the BFF/gRPC path.
// Accepts JSON body: { kind: "product_routing" | "params_only", fileName: string }

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

    const res = await getCostDataImportClient().getImportUploadURL(
      { kind: toImportKind(body.kind), fileName: body.fileName ?? "" },
      metadata,
    )

    if (res.base && !res.base.isSuccess) {
      return NextResponse.json({ base: res.base }, { status: 422 })
    }

    return NextResponse.json({
      base: res.base,
      uploadUrl: res.uploadUrl,
      objectKey: res.objectKey,
      expiresInSeconds: res.expiresInSeconds,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error getting import upload URL:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to get upload URL",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
