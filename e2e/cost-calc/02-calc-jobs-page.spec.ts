import { test, expect } from "@playwright/test"
import { loginAs } from "../helpers/login"

test.describe("calc jobs list page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("list loads, status filter works, new-job dialog opens", async ({
    page,
  }) => {
    await page.goto("/finance/calc-jobs")
    await expect(
      page.getByRole("heading", { name: /calc jobs/i }),
    ).toBeVisible()

    // Filter by status (combobox label may be "Status").
    await page.getByLabel(/status/i).first().click()
    await page.getByRole("option", { name: /processing/i }).click()

    // Open new-job dialog.
    await page.getByRole("button", { name: /new job/i }).click()
    await expect(page.getByText(/trigger.*calc job/i)).toBeVisible()

    // Cancel.
    await page.getByRole("button", { name: /^cancel$/i }).click()
  })
})
