import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers/login"

// Fill-Assignment E2E specs — three surface areas:
//  1. Fill Config admin page  (/finance/costing/fill-config)
//  2. CPR list page — "Fills" column + tracking drawer
//  3. CPR detail page — "Fill Tracking" tab
//
// Prerequisites (same as other cost-calc specs):
//   - Finance gRPC :50051 + IAM gRPC :50052 (with fill-assignment migrations applied)
//   - Frontend on E2E_BASE_URL (default http://localhost:3000)
//   - Seeded superadmin: admin@goapps.dev / admin123

// ---------------------------------------------------------------------------
// 1. Fill Config Page
// ---------------------------------------------------------------------------

test.describe("fill config page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("page loads with heading and tabs", async ({ page }) => {
    await page.goto("/finance/costing/fill-config")
    await expect(
      page.getByRole("heading", { name: /fill assignment config/i }),
    ).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByRole("tab", { name: /global defaults/i }),
    ).toBeVisible()
    await expect(
      page.getByRole("tab", { name: /product overrides/i }),
    ).toBeVisible()
  })

  test("page renders without server error", async ({ page }) => {
    await page.goto("/finance/costing/fill-config")
    await page
      .getByRole("heading", { name: /fill assignment config/i })
      .waitFor({ timeout: 10_000 })
    await expect(page.locator("body")).not.toContainText("500")
    await expect(page.locator("body")).not.toContainText("Internal Server Error")
  })

  test("global defaults tab shows table or empty state", async ({ page }) => {
    await page.goto("/finance/costing/fill-config")
    await page
      .getByRole("tab", { name: /global defaults/i })
      .waitFor({ timeout: 10_000 })

    // Wait until loading spinner disappears (either table or "No global configs" message)
    await expect(
      page.locator("table, p:has-text('No global configs')"),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("product overrides tab shows placeholder text", async ({ page }) => {
    await page.goto("/finance/costing/fill-config")
    await page.getByRole("tab", { name: /product overrides/i }).click()
    await expect(
      page.getByText(/per-product level overrides/i),
    ).toBeVisible({ timeout: 5_000 })
  })

  test("Add Level button opens the level config dialog", async ({ page }) => {
    await page.goto("/finance/costing/fill-config")
    await page
      .getByRole("heading", { name: /fill assignment config/i })
      .waitFor({ timeout: 10_000 })

    await page.getByRole("button", { name: /add level/i }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    await expect(dialog.getByText(/add level config/i)).toBeVisible()
    // Route Level numeric input
    await expect(dialog.getByText(/route level/i)).toBeVisible()
    // Filler Type select
    await expect(dialog.getByText(/filler type/i)).toBeVisible()
  })

  test("dialog closes when Cancel is clicked", async ({ page }) => {
    await page.goto("/finance/costing/fill-config")
    await page
      .getByRole("heading", { name: /fill assignment config/i })
      .waitFor({ timeout: 10_000 })

    await page.getByRole("button", { name: /add level/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 })

    await page.getByRole("button", { name: /cancel/i }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })

  test("Edit button opens pre-populated dialog (if a config row exists)", async ({
    page,
  }) => {
    await page.goto("/finance/costing/fill-config")
    await page
      .getByRole("heading", { name: /fill assignment config/i })
      .waitFor({ timeout: 10_000 })

    // If the migration seeded at least one level, "Edit" buttons will be present.
    const editBtn = page.getByRole("button", { name: /^edit$/i }).first()
    const hasEdit = (await editBtn.count()) > 0

    if (!hasEdit) {
      test.skip(true, "No seeded fill config rows — skipping Edit pre-population test")
      return
    }

    await editBtn.click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    // The dialog title changes to "Edit Level Config" for an existing record.
    await expect(dialog.getByText(/edit level config/i)).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// 2. CPR List Page — "Fills" column + tracking drawer
// ---------------------------------------------------------------------------

test.describe("CPR list page — fills column", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("list page loads and has a Fills column header", async ({ page }) => {
    await page.goto("/finance/product-requests")
    // Wait for the table to appear (RequestTable renders <TableHead>Fills</TableHead>
    // whenever onTrack is provided, which the page always passes).
    await expect(page.getByRole("columnheader", { name: /^fills$/i })).toBeVisible({
      timeout: 15_000,
    })
  })

  test("track fill tasks button opens the tracking drawer", async ({ page }) => {
    await page.goto("/finance/product-requests")
    await page
      .getByRole("columnheader", { name: /^fills$/i })
      .waitFor({ timeout: 15_000 })

    // The ListChecks icon button has aria-label="Track fill tasks" (see request-table.tsx).
    const trackBtn = page
      .getByRole("button", { name: /track fill tasks/i })
      .first()

    if ((await trackBtn.count()) === 0) {
      test.skip(true, "No CPR rows available — skipping drawer-open test")
      return
    }

    await trackBtn.click()

    // FillTrackingDrawer renders a <SheetTitle> that says "Fill Tracking — <requestNo>"
    await expect(page.getByText(/fill tracking —/i)).toBeVisible({
      timeout: 5_000,
    })
  })

  test("tracking drawer closes when dismissed", async ({ page }) => {
    await page.goto("/finance/product-requests")
    await page
      .getByRole("columnheader", { name: /^fills$/i })
      .waitFor({ timeout: 15_000 })

    const trackBtn = page
      .getByRole("button", { name: /track fill tasks/i })
      .first()

    if ((await trackBtn.count()) === 0) {
      test.skip(true, "No CPR rows available — skipping drawer-close test")
      return
    }

    await trackBtn.click()
    await expect(page.getByText(/fill tracking —/i)).toBeVisible({
      timeout: 5_000,
    })

    // Close the Sheet via the close button (shadcn Sheet renders an X button).
    await page.keyboard.press("Escape")
    await expect(page.getByText(/fill tracking —/i)).not.toBeVisible({
      timeout: 5_000,
    })
  })

  test("tracking drawer shows fill task table or empty message", async ({ page }) => {
    await page.goto("/finance/product-requests")
    await page
      .getByRole("columnheader", { name: /^fills$/i })
      .waitFor({ timeout: 15_000 })

    const trackBtn = page
      .getByRole("button", { name: /track fill tasks/i })
      .first()

    if ((await trackBtn.count()) === 0) {
      test.skip(true, "No CPR rows available — skipping drawer-content test")
      return
    }

    await trackBtn.click()
    await page.getByText(/fill tracking —/i).waitFor({ timeout: 5_000 })

    // After loading resolves, the drawer shows either the task table or an empty notice.
    await expect(
      page.locator(
        "[role='dialog'] table, [role='dialog'] p:has-text('No fill tasks')",
      ),
    ).toBeVisible({ timeout: 10_000 })
  })
})

// ---------------------------------------------------------------------------
// 3. CPR Detail Page — Fill Tracking tab
// ---------------------------------------------------------------------------

test.describe("CPR detail page — fill tracking tab", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("navigating to a detail page from the list works", async ({ page }) => {
    await page.goto("/finance/product-requests")
    await page
      .getByRole("columnheader", { name: /^fills$/i })
      .waitFor({ timeout: 15_000 })

    // Click the first "Open" icon button (ArrowRight, aria-label="Open") to navigate.
    const openBtn = page.getByRole("button", { name: /^open$/i }).first()
    if ((await openBtn.count()) === 0) {
      test.skip(true, "No CPR rows available — skipping detail navigation test")
      return
    }

    await openBtn.click()
    await expect(page).toHaveURL(/\/finance\/product-requests\/\d+/, {
      timeout: 10_000,
    })
    // Overview tab is always present.
    await expect(page.getByRole("tab", { name: /overview/i })).toBeVisible({
      timeout: 10_000,
    })
  })

  test("fill tracking tab renders for requests in fill-tracked statuses", async ({
    page,
  }) => {
    await page.goto("/finance/product-requests")
    await page
      .getByRole("columnheader", { name: /^fills$/i })
      .waitFor({ timeout: 15_000 })

    // Filter to PARAMETER_PENDING status to maximise the chance of finding fill-tracked requests.
    await page
      .getByRole("combobox")
      .filter({ hasText: /all statuses/i })
      .click()
    await page.getByRole("option", { name: /parameter.?pending/i }).click()

    // Give the filtered list time to reload.
    await page.waitForTimeout(1_500)

    const openBtn = page.getByRole("button", { name: /^open$/i }).first()
    if ((await openBtn.count()) === 0) {
      test.skip(true, "No PARAMETER_PENDING CPR rows — skipping fill-tracking tab test")
      return
    }

    await openBtn.click()
    await expect(page).toHaveURL(/\/finance\/product-requests\/\d+/, {
      timeout: 10_000,
    })

    // The "Fill Tracking" tab is rendered for PARAMETER_PENDING (see detail-client.tsx).
    const fillTab = page.getByRole("tab", { name: /fill tracking/i })
    await expect(fillTab).toBeVisible({ timeout: 10_000 })
    await fillTab.click()

    // After clicking, the tab content should load without errors.
    await expect(page.locator("body")).not.toContainText("Error")
    // Either the task table or the empty notice.
    await expect(
      page.locator(
        "table:has(th:has-text('Level')), p:has-text('No fill tasks')",
      ),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("fill tracking tab is absent for requests not in fill-tracked statuses", async ({
    page,
  }) => {
    await page.goto("/finance/product-requests")
    await page
      .getByRole("columnheader", { name: /^fills$/i })
      .waitFor({ timeout: 15_000 })

    // Filter to DRAFT — fill tracking tab must not appear.
    await page
      .getByRole("combobox")
      .filter({ hasText: /all statuses/i })
      .click()
    await page.getByRole("option", { name: /^draft$/i }).click()

    await page.waitForTimeout(1_500)

    const openBtn = page.getByRole("button", { name: /^open$/i }).first()
    if ((await openBtn.count()) === 0) {
      test.skip(true, "No DRAFT CPR rows — skipping absent-tab test")
      return
    }

    await openBtn.click()
    await expect(page).toHaveURL(/\/finance\/product-requests\/\d+/, {
      timeout: 10_000,
    })
    await page.getByRole("tab", { name: /overview/i }).waitFor({ timeout: 10_000 })

    // Fill Tracking tab must NOT be present for DRAFT requests.
    await expect(
      page.getByRole("tab", { name: /fill tracking/i }),
    ).not.toBeVisible()
  })

  test("fill progress mini-widget renders on detail overview (if fill-tracked)", async ({
    page,
  }) => {
    await page.goto("/finance/product-requests")
    await page
      .getByRole("columnheader", { name: /^fills$/i })
      .waitFor({ timeout: 15_000 })

    // Filter to PARAMETER_PENDING.
    await page
      .getByRole("combobox")
      .filter({ hasText: /all statuses/i })
      .click()
    await page.getByRole("option", { name: /parameter.?pending/i }).click()

    await page.waitForTimeout(1_500)

    const openBtn = page.getByRole("button", { name: /^open$/i }).first()
    if ((await openBtn.count()) === 0) {
      test.skip(true, "No PARAMETER_PENDING CPR rows — skipping progress-widget test")
      return
    }

    await openBtn.click()
    await expect(page).toHaveURL(/\/finance\/product-requests\/\d+/, {
      timeout: 10_000,
    })
    // Overview tab is default — FillProgressMini is rendered inside it.
    // The widget only renders if there are tasks (useFillTasks returns > 0 items).
    // Use a soft assertion: if visible, it must contain the right text.
    const widget = page.getByText(/fill progress/i)
    const widgetVisible = await widget.isVisible().catch(() => false)
    if (widgetVisible) {
      await expect(page.getByText(/levels approved/i)).toBeVisible()
    }
    // If the widget is not visible, there are no fill tasks yet — also valid.
  })
})
