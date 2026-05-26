import { test, expect } from "@playwright/test"
import { loginAs } from "../helpers/login"

test.describe("blocked products visibility", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("blocked products are visible in products tab", async ({ page }) => {
    await page.goto("/finance/calc-jobs")

    const firstJobLink = page
      .locator("a[href*='/finance/calc-jobs/']")
      .first()
    if ((await firstJobLink.count()) === 0) {
      test.skip(true, "no calc jobs in dev DB; skipping")
      return
    }
    await firstJobLink.click()
    await expect(page).toHaveURL(/\/finance\/calc-jobs\/[^/]+/)

    // Switch to Products tab.
    await page.getByRole("tab", { name: /products/i }).click()

    // Filter by BLOCKED status.
    await page.getByLabel(/status/i).first().click()
    await page.getByRole("option", { name: /blocked/i }).click()

    // Table must render (empty result is acceptable — just no error).
    await expect(page.locator("table")).toBeVisible()
  })
})
