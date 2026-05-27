// CostProductMaster — set/unset ERP linkage.
import { NextRequest, NextResponse } from "next/server"
import { getCostProductMasterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ productSysId: string }> }) {
  try {
    const { productSysId } = await params
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostProductMasterClient()
    const response = await client.updateCostProductMasterErpLinkage(
      {
        productSysId: Number(productSysId),
        erpItemCode: body.erpItemCode || body.erp_item_code || "",
        erpGradeCode1: body.erpGradeCode1 || body.erp_grade_code_1 || "",
        erpGradeCode2: body.erpGradeCode2 || body.erp_grade_code_2 || "",
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to update ERP linkage", validationErrors: [] } }, { status: 500 })
  }
}
