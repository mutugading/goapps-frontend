import { test, expect } from "@playwright/test"

// Admin wizard: walk the 7 steps and create a new dashboard end-to-end (zero-JSON).
// Requires demo fact data so the Data-Binding dropdowns are populated (type=MIS).

const CODE = `E2E_DASH_${Date.now()}`

test.describe("BI admin wizard", () => {
  test("admin panel tabs render", async ({ page }) => {
    await page.goto("/finance/bi/admin")
    await expect(page.getByText("Dashboard Administration")).toBeVisible()
    await expect(page.getByRole("tab", { name: "Dashboards" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Groups" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "ETL Jobs" })).toBeVisible()
  })

  test("create a bar dashboard through the wizard", async ({ page }) => {
    await page.goto("/finance/bi/admin/new")
    await expect(page.getByText("New Dashboard")).toBeVisible()

    // Step 1 — Basic
    await page.fill('input[placeholder="EBITDA"]', CODE)
    await page.fill('input[placeholder="EBITDA Performance"]', "E2E Test Dashboard")
    // Group select (first combobox) — pick the first option.
    await page.getByText("Select group").click()
    await page.getByRole("option").first().click()
    await page.getByRole("button", { name: "Next" }).click()

    // Step 2 — Data binding: choose type MIS.
    await page.getByText("Select type").click()
    await page.getByRole("option", { name: "MIS" }).click()
    await page.getByRole("button", { name: "Next" }).click()

    // Step 3 — Chart type: pick Bar Chart.
    await page.getByText("Bar Chart", { exact: true }).click()
    await page.getByRole("button", { name: "Next" }).click()

    // Step 4 — Field mapping: x = group_1, y = value.
    // (Two Selects rendered from registry requiredFields.)
    const selects = page.locator('[role="combobox"]')
    await selects.nth(0).click()
    await page.getByRole("option", { name: /Group 1/i }).click()
    await selects.nth(1).click()
    await page.getByRole("option", { name: /Value/i }).first().click()
    await page.getByRole("button", { name: "Next" }).click()

    // Step 5 — Style: accept defaults.
    await page.getByRole("button", { name: "Next" }).click()
    // Step 6 — Compare + KPI: accept defaults.
    await page.getByRole("button", { name: "Next" }).click()
    // Step 7 — Access: accept defaults, then create.
    await page.getByRole("button", { name: /Create Dashboard/i }).click()

    // Redirects back to the admin list; the new code should appear.
    await expect(page).toHaveURL(/\/finance\/bi\/admin/)
    await expect(page.getByText(CODE)).toBeVisible({ timeout: 10_000 })
  })
})
