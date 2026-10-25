import { test, expect, type Page } from "@playwright/test"

// H039 — verifikasi browser tab "Kualitas Data" (HR_OT_DQ_MONTH). Login admin dev.
const SHOTS = process.env.H039_SHOTS ?? "/tmp/h039"
const USER = process.env.E2E_USER ?? "admin"
const PASS = process.env.E2E_PASS ?? "admin123"

async function login(page: Page) {
  await page.goto("/login")
  await page.getByLabel(/email|username/i).waitFor({ timeout: 60_000 })
  await page.waitForTimeout(3000)
  await page.getByLabel(/email|username/i).fill(USER)
  await page.getByLabel(/password/i).fill(PASS)
  await page.getByRole("button", { name: /^(sign in|login)$/i }).click()
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 90_000 })
}

test.setTimeout(240_000)

test("H039 kualitas data OT per bulan", async ({ page }) => {
  await login(page)
  await page.goto("/finance/bi/HR_OT_TREND")
  const tab = page.getByRole("link", { name: "Kualitas Data" })
  await expect(tab).toBeVisible({ timeout: 120_000 })
  await tab.click()
  await page.waitForURL(/HR_OT_DQ_MONTH/)
  await expect(page.getByText("Jam Selisih Calc vs Tier").first()).toBeVisible({ timeout: 120_000 })
  await page.waitForTimeout(5000)
  await page.screenshot({ path: `${SHOTS}/dq-month.png`, fullPage: true })
  console.log("BODY:", (await page.locator("main").last().innerText()).replace(/\s+/g, " ").slice(0, 1500))
})
