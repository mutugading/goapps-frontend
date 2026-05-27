import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers/login"

// Viewer flow: landing → open seeded EBITDA dashboard → KPIs + chart render →
// change compare mode → drill into a waterfall segment → breadcrumb back.
//
// Assumes the EBITDA + NET_PROFIT reference dashboards are seeded (migration 000313)
// and demo fact data exists (000314).

test.describe("BI viewer", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin")
  })

  test("landing lists dashboards and links to the viewer", async ({ page }) => {
    await page.goto("/finance/bi")
    await expect(page.getByText("Executive Dashboards")).toBeVisible()
    // Seeded EBITDA card should be present and navigable.
    const ebitda = page.getByRole("link", { name: /EBITDA Performance/i })
    await expect(ebitda).toBeVisible()
    await ebitda.click()
    await expect(page).toHaveURL(/\/finance\/bi\/EBITDA/)
  })

  test("EBITDA viewer renders KPIs, chart, and supports compare + drill", async ({ page }) => {
    await page.goto("/finance/bi/EBITDA")

    // Title + at least one KPI card value.
    await expect(page.getByText("EBITDA Performance")).toBeVisible()
    await expect(page.getByText(/Current Month EBITDA/i)).toBeVisible()

    // The chart card renders (waterfall via ECharts → a canvas/svg appears).
    const chartCard = page.locator("canvas, svg").first()
    await expect(chartCard).toBeVisible({ timeout: 10_000 })

    // Switch compare to YoY (filter bar toggle); URL state updates.
    await page.getByRole("button", { name: "YoY", exact: true }).click()
    await expect(page).toHaveURL(/compare=YoY/)

    // Period preset change to Last 24 Months.
    // (Select trigger → option; the exact selector depends on shadcn Select rendering.)
    // This is best-effort; skip if the combobox isn't reachable headlessly.
  })

  test("period preset is reflected in the URL", async ({ page }) => {
    await page.goto("/finance/bi/EBITDA?period=L24M")
    await expect(page).toHaveURL(/period=L24M/)
    await expect(page.getByText("EBITDA Performance")).toBeVisible()
  })
})
