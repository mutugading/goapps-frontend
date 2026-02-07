// Tests for API Proxy utilities
import { describe, it, expect } from "vitest"
import { SERVICES, createProxyHandlers } from "@/lib/api"

describe("API Proxy Utilities", () => {
  describe("SERVICES", () => {
    it("should have correct service configurations", () => {
      expect(SERVICES.FINANCE.serviceUrlEnv).toBe("FINANCE_SERVICE_URL")
      expect(SERVICES.FINANCE.defaultUrl).toBe("http://localhost:8080")

      expect(SERVICES.PURCHASE.serviceUrlEnv).toBe("PURCHASE_SERVICE_URL")
      expect(SERVICES.IAM.serviceUrlEnv).toBe("IAM_SERVICE_URL")
    })
  })

  describe("createProxyHandlers", () => {
    it("should create all CRUD handlers", () => {
      const proxy = createProxyHandlers({
        service: SERVICES.FINANCE,
        basePath: "/api/v1/finance/uoms",
        resourceName: "unit of measure",
      })

      expect(proxy.list).toBeDefined()
      expect(proxy.create).toBeDefined()
      expect(proxy.get).toBeDefined()
      expect(proxy.update).toBeDefined()
      expect(proxy.delete).toBeDefined()
      expect(proxy.export).toBeDefined()
      expect(proxy.import).toBeDefined()
      expect(proxy.template).toBeDefined()
      expect(proxy.custom).toBeDefined()
    })

    it("should return function handlers", () => {
      const proxy = createProxyHandlers({
        service: SERVICES.FINANCE,
        basePath: "/api/v1/finance/uoms",
        resourceName: "unit of measure",
      })

      // Each handler should return a function
      expect(typeof proxy.list()).toBe("function")
      expect(typeof proxy.create()).toBe("function")
      expect(typeof proxy.get("uomId")).toBe("function")
      expect(typeof proxy.update("uomId")).toBe("function")
      expect(typeof proxy.delete("uomId")).toBe("function")
    })
  })
})
