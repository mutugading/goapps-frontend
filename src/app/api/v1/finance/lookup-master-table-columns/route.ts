import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError, getLookupMasterClient } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const tableName = new URL(request.url).searchParams.get("tableName") ?? ""
    if (!tableName) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "400", message: "tableName required", validationErrors: [] } },
        { status: 400 },
      )
    }
    const metadata = createMetadataFromRequest(request)
    const response = await getLookupMasterClient().listTableColumns({ tableName }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Internal error", validationErrors: [] } },
      { status: 500 },
    )
  }
}
