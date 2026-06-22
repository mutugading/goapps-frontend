// GET /api/v1/finance/costing/template/bulk_product_routing
// Returns 501 until the DownloadBulkProductRoutingTemplate RPC is added to the backend.

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { message: "Template not yet available" },
    { status: 501 },
  )
}
