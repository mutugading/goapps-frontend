import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers/cpr-helpers"

test("debug: production01 detail page load", async ({ page }) => {
  const requests: string[] = []
  page.on("request", req => {
    if (req.url().includes("cost-product-request")) {
      requests.push(`${req.method()} ${req.url().split("?")[0]}`)
    }
  })
  page.on("response", resp => {
    if (resp.url().includes("cost-product-request")) {
      requests.push(`  → ${resp.status()} ${resp.url().split("?")[0]}`)
    }
  })
  
  await loginAs(page, "production01")
  
  // Navigate to request 25 (exists and is at UNDER_REVIEW)
  await page.goto("/finance/product-requests/25")
  await page.waitForLoadState("load")
  
  // Check what's in the page after 5s
  await page.waitForTimeout(5000)
  
  console.log("Requests:", requests)
  const badge = await page.locator('[data-testid="request-status-badge"]').count()
  console.log("Status badge count:", badge)
  const url = page.url()
  console.log("URL:", url)
  
  // Check if there's a "Loading..." text
  const loading = await page.getByText("Loading…").count()
  console.log("Loading text count:", loading)
  
  // Check for "not found"
  const notFound = await page.getByText("not found", { exact: false }).count()
  console.log("Not found text:", notFound)
  
  await page.screenshot({ path: "/tmp/debug-prod01-detail.png" })
})
