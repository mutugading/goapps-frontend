// BI Jobs — get one, update, delete.

import { NextRequest, NextResponse } from "next/server"
import { getBiJobClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiJobClient()
    const response = await client.updateBiJob(
      {
        jobId: id,
        scheduleCron: body.scheduleCron ?? body.schedule_cron ?? undefined,
        oracleProcedure: body.oracleProcedure ?? body.oracle_procedure ?? undefined,
        config: body.config ?? undefined,
        isActive: body.isActive ?? body.is_active ?? undefined,
      },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Update BI job error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to update job", validationErrors: [] } },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const metadata = createMetadataFromRequest(_request)
    const client = getBiJobClient()
    const response = await client.deleteBiJob({ jobId: id }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Delete BI job error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to delete job", validationErrors: [] } },
      { status: 500 }
    )
  }
}
