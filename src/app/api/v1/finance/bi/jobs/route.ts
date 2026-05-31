// BI Jobs — list ETL job registry + create.

import { NextRequest, NextResponse } from "next/server"
import { getBiJobClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const metadata = createMetadataFromRequest(request)
    const client = getBiJobClient()
    const response = await client.listJobs(
      { includeInactive: sp.get("includeInactive") === "true" },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("List BI jobs error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list jobs", validationErrors: [] }, data: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getBiJobClient()
    const response = await client.createBiJob(
      {
        jobName: body.jobName ?? body.job_name ?? "",
        sourceCode: body.sourceCode ?? body.source_code ?? "ERP_ORACLE",
        targetType: body.targetType ?? body.target_type ?? "",
        scheduleCron: body.scheduleCron ?? body.schedule_cron ?? "",
        oracleProcedure: body.oracleProcedure ?? body.oracle_procedure ?? "",
        config: body.config ?? undefined,
        isActive: body.isActive ?? body.is_active ?? true,
      },
      metadata
    )
    return NextResponse.json({ base: response.base, data: response.data }, { status: 201 })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error("Create BI job error:", error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to create job", validationErrors: [] } },
      { status: 500 }
    )
  }
}
