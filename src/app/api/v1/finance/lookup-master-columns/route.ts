import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError, getLookupMasterClient } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const masterCode = new URL(request.url).searchParams.get("masterCode") ?? ""
    if (!masterCode) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "400", message: "masterCode required", validationErrors: [] } },
        { status: 400 },
      )
    }
    const metadata = createMetadataFromRequest(request)
    const response = await getLookupMasterClient().listLookupMasterColumns({ masterCode }, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Internal error", validationErrors: [] } },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const response = await getLookupMasterClient().createLookupMasterColumn(body, metadata)
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Internal error", validationErrors: [] } },
      { status: 500 },
    )
  }
}
