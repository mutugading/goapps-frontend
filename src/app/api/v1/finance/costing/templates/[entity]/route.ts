// GET /api/v1/finance/costing/templates/[entity] — download blank import template

import { NextRequest, NextResponse } from "next/server"
import {
  getCostProductTypeClient,
  getParameterClient,
  getCostProductMasterClient,
  getCostDataImportClient,
  createMetadataFromRequest,
  isGrpcError,
  handleGrpcError,
} from "@/lib/grpc"

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params
  try {
    const metadata = createMetadataFromRequest(request)
    let fileContent: Uint8Array
    let fileName: string

    switch (entity) {
      case "product_type": {
        const res = await getCostProductTypeClient().downloadCostProductTypeTemplate(
          {},
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `template_${entity}.xlsx`
        break
      }
      case "parameter": {
        const res = await getParameterClient().downloadParameterTemplate(
          {},
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `template_${entity}.xlsx`
        break
      }
      case "product_master": {
        const res = await getCostProductMasterClient().downloadCostProductMasterTemplate(
          {},
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `template_${entity}.xlsx`
        break
      }
      case "capp": {
        const res = await getCostDataImportClient().downloadCostApplicableParamTemplate(
          {},
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `template_${entity}.xlsx`
        break
      }
      case "cpp": {
        const res = await getCostDataImportClient().downloadCostProductParameterTemplate(
          {},
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `template_${entity}.xlsx`
        break
      }
      default:
        return NextResponse.json(
          {
            base: {
              isSuccess: false,
              statusCode: "400",
              message: `Unknown entity: ${entity}`,
              validationErrors: [],
            },
          },
          { status: 400 },
        )
    }

    return new NextResponse(Buffer.from(fileContent), {
      headers: {
        "Content-Type": XLSX_CONTENT_TYPE,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error(`Error downloading template for ${entity}:`, error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to download template",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
