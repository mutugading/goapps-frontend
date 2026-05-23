/**
 * Login helper for Playwright specs.
 *
 * NOTE: Playwright is not yet installed in this repo (see e2e/cost-calc/README.md).
 * These specs are documented behavior — they will execute once `@playwright/test`
 * is installed and a global setup (per `E2E_LIFECYCLE_PLAN.md` §0) is wired up.
 *
 * For now this helper uses a thin login via the BFF auth route; once a global
 * `storageState` fixture exists, prefer that and remove per-test logins.
 */
import type { Page } from "@playwright/test"

type SeededUser = "superadmin" | "finance" | "viewer"

const CREDENTIALS: Record<SeededUser, { email: string; password: string }> = {
  // Adjust to match the seeded test users (see PLAN_PRODUCT_ORDER_v3 §S7.12c).
  superadmin: { email: "admin@goapps.dev", password: "admin123" },
  finance: { email: "finance@goapps.dev", password: "finance123" },
  viewer: { email: "viewer@goapps.dev", password: "viewer123" },
}

export async function loginAs(page: Page, user: SeededUser): Promise<void> {
  const creds = CREDENTIALS[user]
  await page.goto("/login")
  await page.getByLabel(/email|username/i).fill(creds.email)
  await page.getByLabel(/password/i).fill(creds.password)
  await page.getByRole("button", { name: /^(sign in|login)$/i }).click()
  // Wait until redirected away from /login.
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15_000,
  })
}
