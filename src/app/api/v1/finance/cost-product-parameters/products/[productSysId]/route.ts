// GET — list required params (with bound values) for one product.
import { NextRequest, NextResponse } from "next/server"
import { getCostProductParameterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productSysId: string }> },
) {
  try {
    const { productSysId } = await params
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductParameterClient()
    const response = await client.listProductRequiredParams(
      {
        productSysId: Number(productSysId || 0),
        requiredOnly: searchParams.get("requiredOnly") === "true",
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Failed to list product params", validationErrors: [] }, data: [] },
      { status: 500 },
    )
  }
}
