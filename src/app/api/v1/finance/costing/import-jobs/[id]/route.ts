// GET /api/v1/finance/costing/import-jobs/[id] — poll async import job status

import { NextRequest, NextResponse } from "next/server"
import {
  getCostDataImportClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const metadata = createMetadataFromRequest(request)
    const jobId = Number(id)
    if (Number.isNaN(jobId) || jobId <= 0) {
      return NextResponse.json(
        {
          base: {
            isSuccess: false,
            statusCode: "400",
            message: "Invalid job id",
            validationErrors: [],
          },
        },
        { status: 400 },
      )
    }

    const res = await getCostDataImportClient().getCostImportJob(
      { jobId },
      metadata,
    )
    return NextResponse.json({
      base: res.base,
      data: res.data,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error(`Error fetching import job ${id}:`, error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to fetch import job",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
