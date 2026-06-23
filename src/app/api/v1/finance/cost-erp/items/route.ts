// CostErpLookup — list items (GET) and create item (POST).
import { NextRequest, NextResponse } from "next/server"
import { getCostErpClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)
    const client = getCostErpClient()
    const response = await client.listCostErpItems(
      {
        search: searchParams.get("search") || "",
        itemType: searchParams.get("itemType") || searchParams.get("item_type") || "",
        activeFilter: (() => { const af = searchParams.get("activeFilter") || searchParams.get("active_filter") || ""; return af === "all" ? "" : af; })(),
        pagination: {
          page: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 50,
        },
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data, pagination: response.pagination })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to list ERP items", validationErrors: [] }, data: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getCostErpClient()
    const response = await client.createCostErpItem(
      {
        itemCode: body.itemCode || body.item_code || "",
        itemName: body.itemName || body.item_name || "",
        itemType: body.itemType || body.item_type || "",
        isActive: body.isActive ?? body.is_active ?? true,
      },
      metadata,
    )
    return NextResponse.json({ base: response.base, data: response.data })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500", message: "Failed to create ERP item", validationErrors: [] } }, { status: 500 })
  }
}
