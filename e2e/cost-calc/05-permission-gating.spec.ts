import { test, expect } from "@playwright/test"
import { loginAs } from "../helpers/login"

test.describe("permission gating", () => {
  test("low-perm user cannot see calc-job trigger buttons", async ({
    page,
  }) => {
    // The 'viewer' seeded user lacks `finance.cost.caljob.trigger`.
    // If that seed isn't present in the dev DB, skip cleanly with a TODO.
    try {
      await loginAs(page, "viewer")
    } catch {
      test.skip(
        true,
        "TODO: seed a 'viewer' role without finance.cost.caljob.trigger to run this spec",
      )
      return
    }

    await page.goto("/finance/calc-jobs")

    // "New job" button should NOT be visible.
    await expect(
      page.getByRole("button", { name: /new job/i }),
    ).toHaveCount(0)

    // On a product detail, Calculate button should NOT appear.
    await page.goto("/finance/product-master")
    const firstProduct = page
      .locator("a[href*='/finance/product-master/']")
      .first()
    if ((await firstProduct.count()) === 0) {
      test.skip(true, "no products seeded; skipping")
      return
    }
    await firstProduct.click()
    await expect(
      page.getByRole("button", { name: /^calculate/i }),
    ).toHaveCount(0)
  })
})
