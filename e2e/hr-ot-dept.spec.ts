import { test, expect, type Page } from "@playwright/test"

// H031 — verifikasi browser KPI "Jam OT per Headcount" di dashboard HR_OT_DEPT (HD-12).
// Prasyarat: finance 000559, job ETL_HR_ATT_DAILY sudah jalan (bi_hr_stg_att_daily terisi). Login admin dev.
const SHOTS = process.env.H031_SHOTS ?? "/tmp/h031"
const USER = process.env.E2E_USER ?? "admin"
const PASS = process.env.E2E_PASS ?? "admin123"

async function login(page: Page) {
  await page.goto("/login")
  await page.getByLabel(/email|username/i).waitFor({ timeout: 60_000 })
  await page.waitForTimeout(3000) // tunggu hydration form
  await page.getByLabel(/email|username/i).fill(USER)
  await page.getByLabel(/password/i).fill(PASS)
  await page.getByRole("button", { name: /^(sign in|login)$/i }).click()
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 90_000 })
}

test.setTimeout(240_000)

test("H031 KPI Jam OT per Headcount", async ({ page }) => {
  await login(page)
  await page.goto("/finance/bi/HR_OT_DEPT")
  await expect(page.getByText("Jam OT per Headcount").first()).toBeVisible({ timeout: 120_000 })
  await page.screenshot({ path: `${SHOTS}/hr-ot-dept.png`, fullPage: true })
  const card = page.getByText("Jam OT per Headcount").first().locator("xpath=ancestor::*[self::div][2]")
  console.log("KPI-CARD:", (await card.innerText()).replace(/\s+/g, " "))
})
