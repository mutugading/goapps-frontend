import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

// GET /api/v1/finance/uoms - List UOMs with filters
export const GET = proxy.list()

// POST /api/v1/finance/uoms - Create UOM
export const POST = proxy.create()
