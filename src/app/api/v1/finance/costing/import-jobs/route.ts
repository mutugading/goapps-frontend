// GET /api/v1/finance/costing/import-jobs — list async import/export jobs

import { NextRequest, NextResponse } from "next/server"
import {
  getCostDataImportClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)

    const res = await getCostDataImportClient().listCostImportJobs(
      {
        entity: searchParams.get("entity") ?? "",
        status: searchParams.get("status") ?? "",
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 20,
        },
      },
      metadata,
    )

    return NextResponse.json({
      base: res.base,
      data: res.data,
      pagination: res.pagination,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Error listing import jobs:", error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to list import jobs",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
