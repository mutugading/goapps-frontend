// GET /api/v1/finance/costing/export/[entity] — export entity data as Excel

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


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const { entity } = await params
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    let fileContent: Uint8Array
    let fileName: string

    switch (entity) {
      case "product_type": {
        const res = await getCostProductTypeClient().exportCostProductTypes(
          {
            activeFilter:
              searchParams.get("activeFilter") ||
              searchParams.get("active_filter") ||
              "",
          },
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `export_${entity}.xlsx`
        break
      }
      case "parameter": {
        const res = await getParameterClient().exportParameters(
          {
            dataType:
              Number(
                searchParams.get("dataType") || searchParams.get("data_type"),
              ) || 0,
            paramCategory:
              Number(
                searchParams.get("paramCategory") ||
                  searchParams.get("param_category"),
              ) || 0,
            activeFilter:
              Number(
                searchParams.get("activeFilter") ||
                  searchParams.get("active_filter"),
              ) || 0,
          },
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `export_${entity}.xlsx`
        break
      }
      case "product_master": {
        const res = await getCostProductMasterClient().exportCostProductMasters(
          {
            productTypeCode:
              searchParams.get("productTypeCode") ||
              searchParams.get("product_type_code") ||
              "",
            activeFilter:
              searchParams.get("activeFilter") ||
              searchParams.get("active_filter") ||
              "",
            search: searchParams.get("search") || "",
          },
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `export_${entity}.xlsx`
        break
      }
      case "capp": {
        const res = await getCostDataImportClient().exportCostApplicableParams(
          {
            productTypeCode:
              searchParams.get("productTypeCode") ||
              searchParams.get("product_type_code") ||
              "",
          },
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `export_${entity}.xlsx`
        break
      }
      case "cpp": {
        const res = await getCostDataImportClient().exportCostProductParameters(
          {
            productTypeCode:
              searchParams.get("productTypeCode") ||
              searchParams.get("product_type_code") ||
              "",
          },
          metadata,
        )
        fileContent = res.fileContent
        fileName = res.fileName || `export_${entity}.xlsx`
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

    return NextResponse.json({
      base: { isSuccess: true, statusCode: "200", message: "OK", validationErrors: [] },
      fileContent: Buffer.from(fileContent).toString("base64"),
      fileName,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    console.error(`Error exporting ${entity}:`, error)
    return NextResponse.json(
      {
        base: {
          isSuccess: false,
          statusCode: "500",
          message: "Failed to export data",
          validationErrors: [],
        },
      },
      { status: 500 },
    )
  }
}
