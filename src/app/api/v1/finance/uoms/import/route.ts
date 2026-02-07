import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

// POST /api/v1/finance/uoms/import - Import UOMs from Excel
export const POST = proxy.import()
