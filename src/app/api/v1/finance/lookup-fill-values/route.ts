import { type NextRequest, NextResponse } from "next/server"
import { createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { getYarnLookupFillClient } from "@/lib/grpc/clients"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lookupMasterCode = searchParams.get("lookupMasterCode") ?? ""
    const selectedKey = searchParams.get("selectedKey") ?? ""
    const sourceParamCode = searchParams.get("sourceParamCode") ?? ""

    if (!lookupMasterCode || !selectedKey) {
      return NextResponse.json(
        { base: { isSuccess: false, message: "lookupMasterCode and selectedKey are required" } },
        { status: 400 }
      )
    }

    const metadata = createMetadataFromRequest(request)
    const response = await getYarnLookupFillClient().getLookupFillValues(
      { lookupMasterCode, selectedKey, sourceParamCode },
      metadata
    )

    return NextResponse.json({
      base: response.base,
      data: {
        numericFills: response.numericFills,
        textFills: response.textFills,
        displayLabel: response.displayLabel,
      },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, message: "Internal error" } },
      { status: 500 }
    )
  }
}
