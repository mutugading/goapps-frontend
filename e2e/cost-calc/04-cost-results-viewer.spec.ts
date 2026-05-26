import { test, expect } from "@playwright/test"
import { loginAs } from "../helpers/login"

test.describe("cost results viewer", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("filters work and breakdown modal opens when results exist", async ({
    page,
  }) => {
    await page.goto("/finance/cost-results")

    // Empty state hint when no product picked.
    await expect(page.getByText(/pick a product/i)).toBeVisible()

    // Pick a product via the ProductMasterCombobox trigger.
    const productPicker = page
      .getByRole("button", { name: /product/i })
      .first()
    await productPicker.click()

    // Pick the first option in the popover list.
    const firstOption = page.getByRole("option").first()
    if ((await firstOption.count()) === 0) {
      test.skip(true, "no products available in picker; skipping")
      return
    }
    await firstOption.click()

    // Set period + calc type.
    await page.getByLabel(/period/i).fill("202604")
    await page.getByLabel(/calc type/i).click()
    await page.getByRole("option", { name: /actual/i }).click()

    // If a result exists, breakdown modal should open with 4 tabs.
    const breakdown = page.getByRole("button", { name: /view breakdown/i })
    if ((await breakdown.count()) > 0) {
      await breakdown.click()
      await expect(page.getByRole("tab", { name: /summary/i })).toBeVisible()
      await expect(page.getByRole("tab", { name: /by level/i })).toBeVisible()
      await expect(
        page.getByRole("tab", { name: /rm breakdown/i }),
      ).toBeVisible()
      await expect(
        page.getByRole("tab", { name: /formula trace/i }),
      ).toBeVisible()
    }
  })
})
