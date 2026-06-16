/**
 * Route Lock & Param Summary E2E Tests
 *
 * Coverage:
 *   RL-01 — Param summary panel is visible on CPR detail page
 *   RL-02 — Lock route requires password confirmation dialog
 *   RL-03 — Correct password locks the route and toggles the button
 *   RL-04 — Locked route shows read-only banner on the fill param page
 *   RL-05 — Confirm action dialog shows param summary before status transition
 *
 * Prerequisites:
 *   - Full stack running: IAM gRPC :50052, Finance gRPC :50051, Frontend :3000
 *   - Migrations applied (see CLAUDE.md for current migration watermarks)
 *   - At least one CPR in CONFIRMED state with a linked route that has all
 *     params filled (needed for RL-02 / RL-03 — Lock Route only appears when
 *     route is COMPLETE and all required params are present)
 *   - Seeded super-admin user: admin@goapps.dev / admin123 (see e2e/helpers/login.ts)
 *   - Seeded regular users from cpr-full-workflow.spec.ts (finance01, production01, etc.)
 *
 * First-time only:
 *   npx playwright install chromium
 *
 * Run all route-lock specs:
 *   npm run test:e2e -- --grep "Route Lock"
 *   # or the full file:
 *   npx playwright test e2e/route-lock.spec.ts --headed
 *
 * Run a single test:
 *   npm run test:e2e -- --grep "RL-01"
 */

import { test, expect } from "@playwright/test"
import { loginAs, gotoRequestDetail } from "./helpers/cpr-helpers"

// ─── RL-01: Param summary panel ──────────────────────────────────────────────

test.describe("Route Lock & Param Summary", () => {
  test.skip("RL-01: param summary panel is visible on CPR detail page", async ({ page }) => {
    // Navigate to a CPR detail page that is in PARAMETER_PENDING or later status
    // and has at least one product with params assigned.
    await loginAs(page, "superadmin")

    // Replace with a real request ID from your test dataset.
    const requestId = "REPLACE_WITH_REAL_REQUEST_ID"
    await gotoRequestDetail(page, requestId)

    // The "Parameter Summary" accordion / section header must be visible.
    const summaryHeader = page.getByRole("button", { name: /parameter summary/i })
    await expect(summaryHeader).toBeVisible({ timeout: 5000 })

    // Expand it if it is collapsed.
    const isExpanded = (await summaryHeader.getAttribute("aria-expanded")) === "true"
    if (!isExpanded) {
      await summaryHeader.click()
    }

    // At least one product accordion item must render inside the summary.
    const productItems = page.locator('[data-testid="param-summary-product-item"]')
    await expect(productItems.first()).toBeVisible({ timeout: 5000 })

    // The filled params count badge must be present (e.g. "3 / 10 filled").
    const countBadge = page.locator('[data-testid="param-summary-count"]').first()
    await expect(countBadge).toBeVisible()
  })

  // ─── RL-02: Lock route opens password dialog ─────────────────────────────

  test.skip("RL-02: lock route requires password confirmation", async ({ page }) => {
    // Precondition: a CPR in CONFIRMED state with a COMPLETE route and all
    // required params filled so that the "Lock Route" button is rendered.
    await loginAs(page, "superadmin")

    const requestId = "REPLACE_WITH_REAL_REQUEST_ID"
    await gotoRequestDetail(page, requestId)

    // The "Lock Route" action button must be present at this state.
    const lockBtn = page.getByRole("button", { name: /lock route/i })
    await expect(lockBtn).toBeVisible({ timeout: 5000 })

    // Clicking opens the password-confirmation dialog.
    await lockBtn.click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 3000 })

    // Dialog title must say "Lock Route" (or similar).
    await expect(dialog.getByRole("heading", { name: /lock route/i })).toBeVisible()

    // The dialog must contain a password input.
    const passwordInput = dialog.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()

    // The confirm button must be present.
    const confirmBtn = dialog.getByRole("button", { name: /confirm lock/i })
    await expect(confirmBtn).toBeVisible()
  })

  // ─── RL-03: Correct password locks the route ─────────────────────────────

  test.skip("RL-03: correct password locks the route", async ({ page }) => {
    // Same precondition as RL-02.
    await loginAs(page, "superadmin")

    const requestId = "REPLACE_WITH_REAL_REQUEST_ID"
    await gotoRequestDetail(page, requestId)

    // Click Lock Route.
    await page.getByRole("button", { name: /lock route/i }).click()
    await page.getByRole("dialog").waitFor({ state: "visible" })

    // Enter the superadmin password.
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill("admin123")

    // Confirm.
    await page.getByRole("button", { name: /confirm lock/i }).click()

    // Success toast must appear.
    const toast = page.locator('[data-sonner-toast]')
    await expect(toast).toContainText(/locked|success/i, { timeout: 8000 })

    // The status badge (or route header card) must now show "LOCKED".
    const lockedBadge = page.getByText(/locked/i).first()
    await expect(lockedBadge).toBeVisible({ timeout: 5000 })

    // "Unlock Route" button must replace "Lock Route".
    await expect(page.getByRole("button", { name: /unlock route/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /^lock route$/i })).not.toBeVisible()
  })

  // ─── RL-04: Locked route shows read-only banner on fill page ─────────────

  test.skip("RL-04: locked route shows read-only banner on fill page", async ({ page }) => {
    // Navigate to the fill-parameter page for a task that belongs to a LOCKED route.
    // The route must already be locked (run RL-03 first, or use a pre-locked fixture).
    await loginAs(page, "finance01")

    // Replace with a real fill-task URL that belongs to a locked route.
    // Pattern: /finance/costing/fill-tasks/{taskId}  or  the FillParamDrawer opened
    // via a CPR detail page → Fill Tracking tab → "Fill Params" button.
    const fillPageUrl = "/finance/costing/fill-tasks/REPLACE_WITH_TASK_ID"
    await page.goto(fillPageUrl)
    await page.waitForLoadState("load")

    // Amber read-only banner must be visible.
    const banner = page.locator('[data-testid="route-locked-banner"]')
    await expect(banner).toBeVisible({ timeout: 5000 })
    await expect(banner).toContainText(/locked.*read.only|read.only.*locked/i)

    // No save or submit button must be rendered for this task.
    await expect(page.getByRole("button", { name: /save.*param|save.*value/i })).not.toBeVisible()
    await expect(page.getByRole("button", { name: /^submit$/i })).not.toBeVisible()
  })

  // ─── RL-05: Confirm action dialog shows param summary before transition ───

  test.skip(
    "RL-05: confirm action dialog shows param summary before transition",
    async ({ page }) => {
      // Navigate to a CPR detail page where the "Confirm" workflow button is available.
      // "Confirm" typically appears when the CPR is in ROUTING_DEFINED or PARAMETER_COMPLETE
      // state and the current user has the appropriate permission.
      await loginAs(page, "finance01")

      const requestId = "REPLACE_WITH_REAL_REQUEST_ID"
      await gotoRequestDetail(page, requestId)

      // Click the "Confirm" workflow transition button.
      const confirmWorkflowBtn = page.getByRole("button", { name: /^confirm$/i })
      await expect(confirmWorkflowBtn).toBeVisible({ timeout: 5000 })
      await confirmWorkflowBtn.click()

      // ConfirmActionDialog must open.
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible({ timeout: 3000 })

      // The dialog must show a param count summary (e.g. "X / Y params filled").
      const paramSummary = dialog.locator('[data-testid="confirm-dialog-param-summary"]')
      await expect(paramSummary).toBeVisible()
      await expect(paramSummary).toContainText(/\d+\s*\/\s*\d+\s*(params|filled)/i)

      // The dialog must show the route lock status (locked / unlocked indicator).
      const lockStatus = dialog.locator('[data-testid="confirm-dialog-lock-status"]')
      await expect(lockStatus).toBeVisible()

      // Clicking "Yes, Confirm" should fire the mutation.
      const yesBtn = dialog.getByRole("button", { name: /yes.*confirm|confirm/i }).last()
      await yesBtn.click()

      // Either a success toast or a status change must be observable.
      const toast = page.locator('[data-sonner-toast]')
      const statusChanged = page.locator('[data-testid="request-status-badge"]').getByText(
        /confirmed|parameter.complete/i,
      )
      await Promise.race([
        expect(toast).toBeVisible({ timeout: 8000 }),
        expect(statusChanged).toBeVisible({ timeout: 8000 }),
      ])
    },
  )
})
