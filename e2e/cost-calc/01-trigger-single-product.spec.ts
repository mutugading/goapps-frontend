import { test, expect } from "@playwright/test"
import { loginAs } from "../helpers/login"

test.describe("trigger single product calc", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("trigger cost calc from product master detail and reach job detail", async ({
    page,
  }) => {
    await page.goto("/finance/product-master")
    // Pick the first product row link.
    const firstProduct = page.getByRole("link", { name: /pty|fg/i }).first()
    if ((await firstProduct.count()) === 0) {
      test.skip(true, "no products seeded in dev DB; skipping")
      return
    }
    await firstProduct.click()
    await expect(page).toHaveURL(/\/finance\/product-master\/[^/]+/)

    // Click Calculate button.
    await page.getByRole("button", { name: /^calculate/i }).first().click()

    // Trigger dialog opens with period prefilled.
    await expect(page.getByText(/trigger cost calculation/i)).toBeVisible()
    await page.getByRole("button", { name: /^trigger$/i }).click()

    // Navigate to calc job detail.
    await expect(page).toHaveURL(/\/finance\/calc-jobs\/[^/]+/, {
      timeout: 30_000,
    })

    // Status badge should resolve within 60s.
    await expect(
      page
        .locator("text=/SUCCESS|PROCESSING|PARTIAL_FAILED|FAILED|BLOCKED/")
        .first(),
    ).toBeVisible({ timeout: 60_000 })
  })
})
