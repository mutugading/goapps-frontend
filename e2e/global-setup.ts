import { chromium, type FullConfig } from "@playwright/test"

/**
 * Logs in once via the real login form and persists the authenticated session to
 * e2e/.auth/state.json, which every spec reuses (config.use.storageState).
 *
 * Credentials come from E2E_USER / E2E_PASSWORD (defaults target the seeded admin).
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000"
  const user = process.env.E2E_USER ?? "admin"
  const password = process.env.E2E_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "admin"

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`)
  await page.fill("#username", user)
  await page.fill("#password", password)
  await page.click('button[type="submit"]')

  // Wait for the dashboard shell to confirm a successful login.
  await page.waitForURL(/\/(dashboard|finance|administrator)/, { timeout: 15_000 })

  await page.context().storageState({ path: "e2e/.auth/state.json" })
  await browser.close()
}

export default globalSetup
