import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for BI Executive Dashboard e2e.
 *
 * Prerequisites (full stack must be running):
 *   - finance gRPC :50051 + IAM gRPC :50052 (with migrations applied incl. bi_* + IAM 000015)
 *   - frontend dev/prod server on E2E_BASE_URL (default http://localhost:3000)
 *   - a seeded admin user; credentials via E2E_USER / E2E_PASSWORD env vars
 *
 * First-time only: `npx playwright install chromium` (downloads the browser binary).
 *
 * Run: `npm run test:e2e`
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    storageState: "e2e/.auth/state.json",
  },
  // Logs in once and saves the authenticated storage state for all specs.
  globalSetup: "./e2e/global-setup.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
