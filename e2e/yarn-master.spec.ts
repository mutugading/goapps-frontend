/**
 * Yarn Master CRUD pages — Playwright E2E spec
 *
 * Covers all 6 yarn master pages under /finance/yarn-master/:
 *   machines, interminglings, product-grades, mb-heads, mb-spins, box-bobbin-costs
 *
 * Prerequisites (full stack must be running):
 *   - Finance gRPC :50051 (migrations applied, yarn master tables present)
 *   - IAM gRPC :50052 (seeded superadmin user)
 *   - Frontend on E2E_BASE_URL (default http://localhost:3000): `npm run dev`
 *   - Seeded users per e2e/helpers/login.ts:
 *       superadmin = admin@goapps.local / admin123
 *   - Browser binary (first run only): `npx playwright install chromium`
 *
 * Run: `npm run test:e2e` (or `npx playwright test e2e/yarn-master.spec.ts`)
 */

import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers/login"

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Assert the page loaded and its header / primary card is visible.
 * `heading` is a string or regex matched against h1-level PageHeader content or
 * a CardTitle inside the main card — both are rendered as text nodes.
 */
async function expectPageLoaded(page: import("@playwright/test").Page, heading: string | RegExp) {
  await page.waitForLoadState("load")
  // React hydration: wait for the heading to appear (it's server-rendered but
  // the client component mounts after hydration — allow up to 10s).
  await expect(page.getByText(heading).first()).toBeVisible({ timeout: 10_000 })
}

/**
 * Assert that the data section rendered — either a <table> (when rows exist)
 * or the DataTable empty-state container (when no rows).
 * Both appear only after the async fetch resolves; the loading skeleton has neither.
 */
async function expectTableOrEmptyState(page: import("@playwright/test").Page) {
  // <table> renders when data.length > 0
  // .justify-center.text-center is the DataTable empty-state div (py-12 text-center justify-center)
  const stable = page
    .locator("table")
    .or(page.locator("div.justify-center.text-center"))
    .first()
  await expect(stable).toBeVisible({ timeout: 15_000 })
}

/**
 * Assert the "Add …" button is visible and clicking it opens a dialog.
 * `buttonName` is matched case-insensitively via regex.
 */
async function expectAddButtonOpensDialog(
  page: import("@playwright/test").Page,
  buttonName: RegExp,
) {
  const addBtn = page.getByRole("button", { name: buttonName })
  await expect(addBtn).toBeVisible()
  await addBtn.click()
  await expect(page.locator("[role='dialog']")).toBeVisible({ timeout: 5_000 })
  // Close the dialog again before the next assertion.
  await page.keyboard.press("Escape")
  await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 5_000 })
}

/**
 * Assert the search/filter input is visible and accepts text without error.
 */
async function expectSearchInputInteractive(page: import("@playwright/test").Page) {
  // DebouncedSearchInput renders a plain <input> with a placeholder containing
  // "search" or "Search". Use a broad locator that covers all variants.
  const searchInput = page
    .getByRole("textbox", { name: /search/i })
    .or(page.locator("input[placeholder*='earch']"))
    .first()
  await expect(searchInput).toBeVisible({ timeout: 8_000 })
  await searchInput.fill("test")
  await searchInput.clear()
}

// ─── 1. Machines ──────────────────────────────────────────────────────────────

test.describe("Yarn Master — Machines", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
    await page.goto("/finance/yarn-master/machines")
  })

  test("page loads without error and shows heading", async ({ page }) => {
    await expectPageLoaded(page, /machines/i)
  })

  test("table renders", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectTableOrEmptyState(page)
  })

  test("Add Machine button opens dialog", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectAddButtonOpensDialog(page, /add machine/i)
  })

  test("search input is visible and interactive", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectSearchInputInteractive(page)
  })

  /**
   * End-to-end create + delete for Machines.
   *
   * Requires a running backend with yarn master migrations applied.
   * The test creates a machine using a timestamped code to avoid collisions,
   * verifies it appears in the table, then deletes it via the row action.
   *
   * Enable by removing the test.skip() call below once the full stack is up.
   */
  test.skip("create and delete a machine record end-to-end (requires backend)", async ({ page }) => {
    const code = `TESTMC${Date.now().toString().slice(-8)}`
    const name = `E2E Test Machine ${code}`

    // ── Create ──────────────────────────────────────────────────────────────
    await page.waitForLoadState("load")

    await page.getByRole("button", { name: /add machine/i }).click()
    await expect(page.locator("[role='dialog']")).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole("heading", { name: /add machine/i })).toBeVisible()

    // Code field — auto-uppercases, already typed uppercase for safety
    await page.getByLabel(/^code/i).fill(code)
    // Name field
    await page.getByLabel(/^name/i).fill(name)

    await page.getByRole("button", { name: /^create$/i }).click()

    // Dialog closes and list refreshes
    await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 10_000 })

    // New row should be visible (search to bring it to the top if list is long)
    const searchInput = page
      .getByRole("textbox", { name: /search/i })
      .or(page.locator("input[placeholder*='earch']"))
      .first()
    await searchInput.fill(code)
    await page.waitForTimeout(400) // debounce

    const row = page.getByRole("row").filter({ hasText: code })
    await expect(row).toBeVisible({ timeout: 10_000 })

    // ── Delete ──────────────────────────────────────────────────────────────
    // Open the row action menu (ellipsis / kebab button in the row)
    await row.getByRole("button").last().click()
    // Wait for the action dropdown / context menu
    await page.getByRole("menuitem", { name: /delete/i }).click()

    // Confirm dialog appears
    await expect(page.locator("[role='dialog']")).toBeVisible({ timeout: 5_000 })
    await page.getByRole("button", { name: /^(confirm|delete)$/i }).last().click()

    // Row disappears
    await expect(row).not.toBeVisible({ timeout: 10_000 })
  })
})

// ─── 2. Interminglings ────────────────────────────────────────────────────────

test.describe("Yarn Master — Interminglings", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
    await page.goto("/finance/yarn-master/interminglings")
  })

  test("page loads without error and shows heading", async ({ page }) => {
    await expectPageLoaded(page, /intermingling/i)
  })

  test("table renders", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectTableOrEmptyState(page)
  })

  test("Add Intermingling button opens dialog", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectAddButtonOpensDialog(page, /add intermingling/i)
  })

  test("search input is visible and interactive", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectSearchInputInteractive(page)
  })
})

// ─── 3. Product Grades ────────────────────────────────────────────────────────

test.describe("Yarn Master — Product Grades", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
    await page.goto("/finance/yarn-master/product-grades")
  })

  test("page loads without error and shows heading", async ({ page }) => {
    await expectPageLoaded(page, /product grade/i)
  })

  test("table renders", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectTableOrEmptyState(page)
  })

  test("Add Product Grade button opens dialog", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectAddButtonOpensDialog(page, /add grade/i)
  })

  test("search input is visible and interactive", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectSearchInputInteractive(page)
  })
})

// ─── 4. MB Heads ─────────────────────────────────────────────────────────────

test.describe("Yarn Master — MB Heads", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
    await page.goto("/finance/yarn-master/mb-heads")
  })

  test("page loads without error and shows heading", async ({ page }) => {
    await expectPageLoaded(page, /mb.?head/i)
  })

  test("table renders", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectTableOrEmptyState(page)
  })

  test("Add MB Head button opens dialog", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectAddButtonOpensDialog(page, /add mb.?head/i)
  })

  test("search input is visible and interactive", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectSearchInputInteractive(page)
  })
})

// ─── 5. MB Spins ─────────────────────────────────────────────────────────────

test.describe("Yarn Master — MB Spins", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
    await page.goto("/finance/yarn-master/mb-spins")
  })

  test("page loads without error and shows heading", async ({ page }) => {
    await expectPageLoaded(page, /mb.?spin/i)
  })

  test("table renders", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectTableOrEmptyState(page)
  })

  test("Add MB Spin button opens dialog", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectAddButtonOpensDialog(page, /add mb.?spin/i)
  })

  test("search input is visible and interactive", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectSearchInputInteractive(page)
  })
})

// ─── 6. Box / Bobbin Costs ────────────────────────────────────────────────────

test.describe("Yarn Master — Box/Bobbin Costs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
    await page.goto("/finance/yarn-master/box-bobbin-costs")
  })

  test("page loads without error and shows heading", async ({ page }) => {
    await expectPageLoaded(page, /box.?bobbin/i)
  })

  test("table renders", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectTableOrEmptyState(page)
  })

  test("Add Box/Bobbin Cost button opens dialog", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectAddButtonOpensDialog(page, /add box.?bobbin/i)
  })

  test("search input is visible and interactive", async ({ page }) => {
    await page.waitForLoadState("load")
    await expectSearchInputInteractive(page)
  })
})
