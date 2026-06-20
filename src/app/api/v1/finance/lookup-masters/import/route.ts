import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError, getLookupMasterClient } from "@/lib/grpc"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json(
        { base: { isSuccess: false, statusCode: "400", message: "file required", validationErrors: [] } },
        { status: 400 },
      )
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const metadata = createMetadataFromRequest(request)
    const response = await getLookupMasterClient().importLookupMasters(
      { fileContent: buffer, fileName: file.name },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Internal error", validationErrors: [] } },
      { status: 500 },
    )
  }
}
