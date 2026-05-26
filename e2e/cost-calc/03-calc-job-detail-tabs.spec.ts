import { test, expect } from "@playwright/test"
import { loginAs } from "../helpers/login"

test.describe("calc job detail tabs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("detail page renders all 4 tabs", async ({ page }) => {
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

    // 4 tabs visible.
    await expect(page.getByRole("tab", { name: /overview/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /products/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /chunks/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /audit/i })).toBeVisible()

    // Cycle through tabs.
    await page.getByRole("tab", { name: /products/i }).click()
    await page.getByRole("tab", { name: /chunks/i }).click()
    await page.getByRole("tab", { name: /audit/i }).click()
    await page.getByRole("tab", { name: /overview/i }).click()
  })
})
