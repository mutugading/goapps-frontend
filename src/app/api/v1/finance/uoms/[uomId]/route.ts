import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

// GET /api/v1/finance/uoms/[uomId] - Get single UOM
export const GET = proxy.get("uomId")

// PUT /api/v1/finance/uoms/[uomId] - Update UOM
export const PUT = proxy.update("uomId")

// DELETE /api/v1/finance/uoms/[uomId] - Delete UOM
export const DELETE = proxy.delete("uomId")
