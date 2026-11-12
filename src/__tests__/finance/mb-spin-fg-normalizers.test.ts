/**
 * P7 normalizers + supersede detection.
 * Every normalizer must read camelCase AND snake_case, coerce numerics via Number(),
 * and default arrays to [].
 */
import { describe, it, expect } from "vitest"

import {
  normalizeSupersedePreview,
  isSupersedeConfirmationError,
  SUPERSEDE_CONFIRMATION_PREFIX,
} from "@/types/finance/mb-head"
import { normalizeUnsupersedeResult, normalizeFgFollowsRecipe } from "@/types/finance/mb-spin"
import {
  normalizeMbLink,
  normalizeEtlPreview,
  normalizeEtlApplyResult,
  MB_LINK_SOURCE_LABELS,
  ETL_STATUS_LABELS,
  ETL_NON_SELECTABLE_STATUSES,
} from "@/types/finance/cost-product-master"
import { SupersedeConfirmationRequiredError } from "@/services/finance/mb-head-api"

describe("normalizeSupersedePreview", () => {
  it("reads camelCase input and sums pointer + text-only rows", () => {
    const out = normalizeSupersedePreview({
      requiresConfirmation: true,
      candidates: [
        {
          oldSpinId: "s1",
          oldSpinCode: "MBS-1",
          shadeCode: "BLK",
          fgProductId: "42",
          paramRowsPointer: "3",
          paramRowsTextOnly: 2,
          oldHeadWillDeactivate: true,
          filledByCounts: [{ filledBy: "AUTOFILL", count: "4" }],
          affectedProducts: [{ productSysId: "9", productCode: "P9", productName: "N", filledBy: "AUTOFILL" }],
          warnings: ["dup text"],
        },
      ],
    })
    expect(out.requiresConfirmation).toBe(true)
    const c = out.candidates[0]
    expect(c.fgProductId).toBe(42)
    expect(c.paramRowsPointer).toBe(3)
    expect(c.paramRowsTextOnly).toBe(2)
    expect(c.paramRowsTotal).toBe(5)
    expect(c.oldHeadWillDeactivate).toBe(true)
    expect(c.filledByCounts).toEqual([{ filledBy: "AUTOFILL", count: 4 }])
    expect(c.affectedProducts[0].productSysId).toBe(9)
    expect(c.warnings).toEqual(["dup text"])
  })

  it("reads snake_case input", () => {
    const out = normalizeSupersedePreview({
      requires_confirmation: true,
      candidates: [
        {
          old_spin_id: "s2",
          old_spin_code: "MBS-2",
          param_rows_pointer: 1,
          param_rows_text_only: "4",
          filled_by_counts: [{ filled_by: "MANUAL", count: 1 }],
          affected_products: [{ product_sys_id: 7, product_code: "P7", product_name: "X", filled_by: "MANUAL" }],
        },
      ],
    })
    expect(out.requiresConfirmation).toBe(true)
    expect(out.candidates[0].oldSpinCode).toBe("MBS-2")
    expect(out.candidates[0].paramRowsTotal).toBe(5)
    expect(out.candidates[0].filledByCounts[0].filledBy).toBe("MANUAL")
    expect(out.candidates[0].affectedProducts[0].productSysId).toBe(7)
  })

  it("defaults to empty arrays and false on missing input", () => {
    expect(normalizeSupersedePreview(undefined)).toEqual({ requiresConfirmation: false, candidates: [] })
    const out = normalizeSupersedePreview({ candidates: [{}] })
    expect(out.candidates[0].filledByCounts).toEqual([])
    expect(out.candidates[0].affectedProducts).toEqual([])
    expect(out.candidates[0].warnings).toEqual([])
    expect(out.candidates[0].paramRowsTotal).toBe(0)
  })
})

describe("isSupersedeConfirmationError", () => {
  it("is true only for 409 AND the message prefix", () => {
    expect(isSupersedeConfirmationError("409", `${SUPERSEDE_CONFIRMATION_PREFIX}: older spin`)).toBe(true)
    expect(isSupersedeConfirmationError(409, `${SUPERSEDE_CONFIRMATION_PREFIX}: x`)).toBe(true)
    expect(isSupersedeConfirmationError("400", `${SUPERSEDE_CONFIRMATION_PREFIX}: x`)).toBe(false)
    expect(isSupersedeConfirmationError("409", "some other conflict")).toBe(false)
    expect(isSupersedeConfirmationError(undefined, undefined)).toBe(false)
  })
})

describe("SupersedeConfirmationRequiredError", () => {
  it("carries mbhId and is an Error with the supersede status", () => {
    const err = new SupersedeConfirmationRequiredError("head-1", "SUPERSEDE_CONFIRMATION_REQUIRED: x")
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe("SupersedeConfirmationRequiredError")
    expect(err.mbhId).toBe("head-1")
    expect(err.statusCode).toBe("409")
    expect(err.message).toContain("SUPERSEDE_CONFIRMATION_REQUIRED")
  })
})

describe("normalizeUnsupersedeResult", () => {
  it("normalizes camelCase and snake_case skipped rows and counts", () => {
    const camel = normalizeUnsupersedeResult({
      paramsReverted: "5",
      skipped: [{ cppValueId: 1, productSysId: 2, productCode: "P", paramCode: "MB_SP_CODE", reason: "locked" }],
    })
    expect(camel.paramsReverted).toBe(5)
    expect(camel.skipped[0]).toEqual({
      cppValueId: 1, productSysId: 2, productCode: "P", paramCode: "MB_SP_CODE", reason: "locked",
    })
    const snake = normalizeUnsupersedeResult({ params_reverted: 2, skipped: [{ cpp_value_id: 3, reason: "r" }] })
    expect(snake.paramsReverted).toBe(2)
    expect(snake.skipped[0].cppValueId).toBe(3)
    expect(snake.skipped[0].reason).toBe("r")
  })

  it("defaults skipped to [] and paramsReverted to 0", () => {
    const out = normalizeUnsupersedeResult({})
    expect(out.skipped).toEqual([])
    expect(out.paramsReverted).toBe(0)
    expect(out.spin).toBeNull()
  })
})

describe("normalizeMbLink", () => {
  it("reads camelCase, coerces fgProductId and candidate ids", () => {
    const out = normalizeMbLink({
      linkSource: "FG_MATCH",
      spinId: "sp",
      spinCode: "MBS",
      fgProductId: "11",
      candidatePoyProductIds: ["3", 4],
      paramMatches: true,
    })
    expect(out.linkSource).toBe("FG_MATCH")
    expect(out.fgProductId).toBe(11)
    expect(out.candidatePoyProductIds).toEqual([3, 4])
    expect(out.paramMatches).toBe(true)
    expect(MB_LINK_SOURCE_LABELS[out.linkSource as "FG_MATCH"]).toBe("FG match")
  })

  it("reads snake_case and defaults", () => {
    const out = normalizeMbLink({ link_source: "SUPERBA", fg_product_id: 2, current_param_value: "X", param_matches: "false" })
    expect(out.linkSource).toBe("SUPERBA")
    expect(out.fgProductId).toBe(2)
    expect(out.currentParamValue).toBe("X")
    expect(out.paramMatches).toBe(false)
    expect(out.candidatePoyProductIds).toEqual([])
    expect(normalizeMbLink(undefined).linkSource).toBe("NONE")
  })
})

describe("normalizeEtlPreview", () => {
  it("normalizes rows, counts and applyLimit from camelCase", () => {
    const out = normalizeEtlPreview({
      runId: "run-1",
      fromDate: "2026-11-01",
      rows: [
        {
          rowKey: "ITEM|BLK",
          status: "NEW_ITEM",
          selectable: true,
          matchedProductIds: ["5"],
          typeCode: "POY",
        },
      ],
      counts: { exists: "1", existsMulti: 0, newShade: 0, newItem: "1", possibleDuplicate: 0, invalidType: 0, total: "2" },
      applyLimit: "200",
    })
    expect(out.runId).toBe("run-1")
    expect(out.rows[0].selectable).toBe(true)
    expect(out.rows[0].matchedProductIds).toEqual([5])
    expect(out.counts.total).toBe(2)
    expect(out.counts.newItem).toBe(1)
    expect(out.applyLimit).toBe(200)
  })

  it("reads snake_case and defaults arrays/counts", () => {
    const out = normalizeEtlPreview({
      run_id: "r2",
      from_date: "2026-11-01",
      rows: [{ row_key: "A|B", selectable: "true", matched_product_ids: [1] }],
      counts: { new_item: 2, existsMulti: 0 },
      apply_limit: 50,
    })
    expect(out.runId).toBe("r2")
    expect(out.fromDate).toBe("2026-11-01")
    expect(out.rows[0].rowKey).toBe("A|B")
    expect(out.rows[0].selectable).toBe(true) // "true" string coerces to true (toBoolean)
    expect(out.counts.newItem).toBe(2)
    expect(out.applyLimit).toBe(50)
    expect(normalizeEtlPreview(undefined).rows).toEqual([])
  })

  it("exposes non-selectable status set and status labels", () => {
    expect(ETL_NON_SELECTABLE_STATUSES).toContain("EXISTS")
    expect(ETL_NON_SELECTABLE_STATUSES).not.toContain("NEW_ITEM")
    expect(ETL_STATUS_LABELS.NEW_SHADE).toBe("New shade")
  })
})

describe("normalizeEtlApplyResult", () => {
  it("normalizes camelCase and snake_case rows", () => {
    const camel = normalizeEtlApplyResult({
      runId: "r",
      inserted: "2",
      skipped: 1,
      failed: 0,
      rows: [{ rowKey: "A|B", result: "INSERTED", productSysId: "10", productCode: "PC", message: "" }],
    })
    expect(camel.inserted).toBe(2)
    expect(camel.rows[0].productSysId).toBe(10)
    const snake = normalizeEtlApplyResult({ run_id: "r", failed: 3, rows: [{ row_key: "X", product_sys_id: 4 }] })
    expect(snake.failed).toBe(3)
    expect(snake.rows[0].rowKey).toBe("X")
    expect(snake.rows[0].productSysId).toBe(4)
    expect(normalizeEtlApplyResult(undefined).rows).toEqual([])
  })
})

describe("normalizeFgFollowsRecipe (P8-RBE-3)", () => {
  it("reads camelCase and snake_case, defaults to false", () => {
    expect(normalizeFgFollowsRecipe({ fgFollowsRecipe: true })).toBe(true)
    expect(normalizeFgFollowsRecipe({ fg_follows_recipe: true })).toBe(true)
    expect(normalizeFgFollowsRecipe({})).toBe(false)
    expect(normalizeFgFollowsRecipe(null)).toBe(false)
  })
})
