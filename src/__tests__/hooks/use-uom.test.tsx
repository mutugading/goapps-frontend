// Tests for UOM hooks - Query Keys Unit Tests
// Integration tests for data fetching are skipped as they require
// additional MSW configuration for the specific API client setup.
import { describe, it, expect } from "vitest"
import { uomKeys } from "@/hooks/finance/use-uom"

describe("UOM Hooks", () => {
  describe("uomKeys", () => {
    it("should have hierarchical query keys with finance scope", () => {
      // All keys should start with ["finance", "uom"]
      expect(uomKeys.all).toEqual(["finance", "uom"])
    })

    it("should return list keys", () => {
      expect(uomKeys.lists()).toEqual(["finance", "uom", "list"])
    })

    it("should return list keys with params", () => {
      const params = { page: 1, pageSize: 10 }
      expect(uomKeys.list(params)).toEqual(["finance", "uom", "list", params])
    })

    it("should return detail keys", () => {
      expect(uomKeys.details()).toEqual(["finance", "uom", "detail"])
    })

    it("should return detail key for specific ID", () => {
      expect(uomKeys.detail("uom-123")).toEqual(["finance", "uom", "detail", "uom-123"])
    })

    it("should have consistent key hierarchy for cache invalidation", () => {
      // This ensures we can invalidate all UOM queries with:
      // queryClient.invalidateQueries({ queryKey: ["finance", "uom"] })
      const listKeys = uomKeys.lists()
      const detailKeys = uomKeys.details()

      // Both should start with the same base
      expect(listKeys.slice(0, 2)).toEqual(uomKeys.all)
      expect(detailKeys.slice(0, 2)).toEqual(uomKeys.all)
    })

    it("should support service-level invalidation", () => {
      // Can invalidate all finance queries with queryKey: ["finance"]
      expect(uomKeys.all[0]).toBe("finance")
    })
  })
})
