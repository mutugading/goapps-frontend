import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError, getLookupMasterClient } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const metadata = createMetadataFromRequest(request)
    const response = await getLookupMasterClient().exportLookupMasters({}, metadata)
    if (!response.base?.isSuccess) {
      return NextResponse.json({ base: response.base }, { status: 400 })
    }
    return new NextResponse(Buffer.from(response.fileContent), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${response.fileName || "lookup_masters.xlsx"}"`,
      },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Internal error", validationErrors: [] } },
      { status: 500 },
    )
  }
}
