import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError, getLookupMasterClient } from "@/lib/grpc"

type RouteContext = { params: Promise<{ lmCode: string }> }

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { lmCode } = await context.params
    const metadata = createMetadataFromRequest(request)
    const response = await getLookupMasterClient().deleteLookupMaster({ lmCode }, metadata)
    return NextResponse.json({ base: response.base })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Internal error", validationErrors: [] } },
      { status: 500 },
    )
  }
}
