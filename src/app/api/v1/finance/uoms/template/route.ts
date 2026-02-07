import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

// GET /api/v1/finance/uoms/template - Download import template
export const GET = proxy.template()
