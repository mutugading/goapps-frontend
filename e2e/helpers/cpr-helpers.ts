import { type Page, expect } from "@playwright/test"

// ─── Auth ────────────────────────────────────────────────────────────────────

export const TEST_USERS = {
  marketing01:   { username: "marketing01",   password: "Mgt123456789" },
  marketingmgr:  { username: "marketingmgr",  password: "Mgt123456789" },
  finance01:     { username: "finance01",      password: "Mgt123456789" },
  financemgr:    { username: "financemgr",     password: "Mgt123456789" },
  production01:  { username: "production01",   password: "Mgt123456789" },
  production02:  { username: "production02",   password: "Mgt123456789" },
  production03:  { username: "production03",   password: "Mgt123456789" },
  productionmgr: { username: "productionmgr",  password: "Mgt123456789" },
}

export async function loginAs(page: Page, user: keyof typeof TEST_USERS) {
  const { username, password } = TEST_USERS[user]

  // Call the login API via page.request so Set-Cookie headers are applied to the browser
  // context, avoiding the login-page background image that intercepts button clicks.
  const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000"
  const resp = await page.request.post(`${baseUrl}/api/v1/iam/auth/login`, {
    data: { username, password },
  })
  if (!resp.ok()) {
    throw new Error(`Login API failed for ${username}: ${resp.status()}`)
  }
  const body = await resp.json()
  if (!body?.base?.isSuccess) {
    throw new Error(`Login rejected for ${username}: ${body?.base?.message}`)
  }

  // The BFF sets goapps_access_token + goapps_refresh_token as HttpOnly cookies.
  // page.request shares storage state with the browser context, so they are now set.
  // Navigate directly to the product-requests page (protected route).
  await page.goto("/finance/product-requests")
  await page.waitForLoadState("load")

  // If redirected to login the cookies weren't set — fail with a clear message
  if (page.url().includes("/login")) {
    throw new Error(`Login cookies not applied for ${username} — still on login page`)
  }
}

export async function logout(page: Page) {
  // Click user avatar/menu in nav
  await page.locator('[data-testid="nav-user-trigger"]').click()
  await page.getByRole("menuitem", { name: /log out|sign out/i }).click()
  await page.waitForURL("/login")
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export async function gotoProductRequests(page: Page) {
  await page.goto("/finance/product-requests")
  await page.waitForLoadState("load")
}

export async function gotoRequestDetail(page: Page, requestId: string | number) {
  if (!requestId) throw new Error(`gotoRequestDetail: requestId is empty — prior test may have failed to set it`)
  await page.goto(`/finance/product-requests/${requestId}`)
  await page.waitForLoadState("load")
  // Wait for the React app to hydrate and load auth/permissions — the status badge
  // is only rendered after the request data and user permissions are both resolved.
  await page.waitForSelector('[data-testid="request-status-badge"]', { timeout: 15000 })
}

// ─── CPR Create ───────────────────────────────────────────────────────────────

// urgency values as accepted by the form Select ("low"/"medium"/"high")
const URGENCY_MAP: Record<string, string> = {
  NORMAL: "medium",
  HIGH: "high",
  URGENT: "high",
  low: "low",
  medium: "medium",
  high: "high",
}

export interface CreateCprInput {
  title: string
  classification?: "existing" | "new"
  urgency?: "NORMAL" | "HIGH" | "URGENT" | "low" | "medium" | "high"
  customerName?: string
  description?: string
}

export async function createDraftRequest(
  page: Page,
  input: CreateCprInput,
): Promise<string> {
  await gotoProductRequests(page)

  // Click new request button
  await page.getByRole("button", { name: /new request/i }).click()
  await page.waitForSelector('[role="dialog"]', { state: "visible" })

  // Select request type (required) — trigger has role="combobox" but no accessible name;
  // filter by placeholder text. Pick QUOTE to avoid forced "new" classification + spec section.
  const typeCombobox = page.getByRole("combobox").filter({ hasText: /select request type/i })
  await typeCombobox.waitFor({ state: "visible", timeout: 5000 })
  await typeCombobox.click()
  await page.waitForSelector('[role="option"]', { state: "visible", timeout: 5000 })
  const quoteOption = page.getByRole("option", { name: /QUOTE/i })
  if (await quoteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await quoteOption.click()
  } else {
    await page.getByRole("option").first().click()
  }

  // Fill customer name (required) — use name attribute selector for reliability
  await page.locator('input[name="customerName"]').fill(input.customerName ?? "E2E Test Customer")

  // Fill title
  await page.getByLabel(/^title/i).fill(input.title)

  // Classification: RadioGroup — value="existing" is the default, so only click when changing.
  if (input.classification === "new") {
    await page.locator('[role="radio"][value="new"]').click()
  } else if (input.classification === "existing") {
    // existing is the default; only click to ensure state if needed
    await page.locator('[role="radio"][value="existing"]').click()
  }

  // Urgency: Select with values low/medium/high
  if (input.urgency) {
    const urgencyValue = URGENCY_MAP[input.urgency] ?? "medium"
    // Click the SelectTrigger — accessible name is "Urgency *"
    const urgencyItem = page.getByRole("combobox", { name: /urgency/i })
    await urgencyItem.click()
    await page.getByRole("option", { name: new RegExp(`^${urgencyValue}$`, "i") }).click()
  }

  if (input.description) {
    await page.getByLabel(/description/i).fill(input.description)
  }

  // Submit form — button says "Create request"
  await page.getByRole("button", { name: /create request/i }).click()

  // Wait for dialog to close and page to update
  await page.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 10000 })
  await page.waitForLoadState("load")

  // The list page refreshes — find the newly created row and navigate to it
  await page.getByText(input.title).first().click({ timeout: 10000 })
  await page.waitForURL(/product-requests\/\d+/, { timeout: 10000 })
  const newUrl = page.url()
  const idMatch = newUrl.match(/product-requests\/(\d+)/)
  return idMatch?.[1] ?? ""
}

// ─── Status Transitions ───────────────────────────────────────────────────────

export async function submitRequest(page: Page) {
  const btn = page.getByRole("button", { name: /^submit$/i })
  await expect(btn).toBeVisible()
  // Wait for the BFF mutation response before asserting UI update
  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/submit") && r.request().method() === "POST",
      { timeout: 15000 },
    ).catch(() => null),
    btn.click(),
  ])
  if (response && !response.ok()) {
    const body = await response.json().catch(() => ({}))
    throw new Error(`Submit failed: ${response.status()} — ${JSON.stringify(body)}`)
  }
  await expectStatus(page, "SUBMITTED")
}

export async function startReview(page: Page) {
  await page.getByRole("button", { name: /start review/i }).click()
  await page.waitForLoadState("load")
  await expectStatus(page, "UNDER_REVIEW")
}

export async function decideFeasibility(
  page: Page,
  decision: "FEASIBLE" | "NOT_FEASIBLE",
  note = "Test note",
) {
  await page.getByRole("button", { name: /decide feasibility/i }).click()
  await page.waitForSelector('[role="dialog"]', { state: "visible" })

  // Select decision — use value attribute to avoid /FEASIBLE/i matching both "Feasible" and "Not feasible"
  const radio = page.locator(`[role="radio"][value="${decision}"]`)
  await radio.click()

  // Fill note
  const noteField = page.getByLabel(/note/i)
  if (await noteField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await noteField.fill(note)
  }

  // Button label is "Approve" for FEASIBLE, "Reject as infeasible" for NOT_FEASIBLE
  const submitBtn = decision === "FEASIBLE"
    ? page.getByRole("button", { name: /^approve$/i })
    : page.getByRole("button", { name: /reject as infeasible/i })
  await submitBtn.click()
  await page.waitForLoadState("load")

  if (decision === "FEASIBLE") {
    await expectStatus(page, "ROUTING_DEFINED")
  } else {
    await expectStatus(page, "REJECTED")
  }
}

export async function useExistingCosting(page: Page, productCode: string) {
  await page.getByRole("button", { name: /use existing costing/i }).click()
  await page.waitForSelector('[role="dialog"]', { state: "visible" })

  // Search for product
  const searchInput = page.getByPlaceholder(/search.*product|product.*code/i)
  await searchInput.fill(productCode)
  await page.waitForTimeout(500) // debounce

  // Select from dropdown
  await page.getByRole("option", { name: new RegExp(productCode, "i") }).first().click()

  await page.getByRole("button", { name: /^(confirm|select|use)$/i }).last().click()
  await page.waitForLoadState("load")
  await expectStatus(page, "QUOTE_READY")
}

export async function rejectRequest(page: Page, reason: string) {
  await page.getByRole("button", { name: /^reject$/i }).click()
  await page.waitForSelector('[role="dialog"]', { state: "visible" })
  await page.getByLabel(/reason/i).fill(reason)
  await page.getByRole("button", { name: /^(confirm reject|reject)$/i }).last().click()
  await page.waitForLoadState("load")
  await expectStatus(page, "REJECTED")
}

export async function reviseRequest(page: Page) {
  await page.getByRole("button", { name: /revise.*resubmit/i }).click()
  await page.waitForLoadState("load")
  await expectStatus(page, "SUBMITTED")
}

export async function cancelRequest(page: Page, reason = "Test cancellation") {
  await page.getByRole("button", { name: /^cancel$/i }).click()
  await page.waitForSelector('[role="dialog"]', { state: "visible" })
  const reasonField = page.getByLabel(/reason/i)
  if (await reasonField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await reasonField.fill(reason)
  }
  await page.getByRole("button", { name: /^(confirm|cancel request)$/i }).last().click()
  await page.waitForLoadState("load")
  await expectStatus(page, "CLOSED")
}

export async function markParametersComplete(page: Page) {
  await page.getByRole("button", { name: /mark.*parameters.*complete/i }).click()
  await page.waitForLoadState("load")
  await expectStatus(page, "PARAMETER_COMPLETE")
}

// ─── Routing ──────────────────────────────────────────────────────────────────

export interface RouteLevel {
  productCode: string
  productName: string
  stages: RouteStage[]
}

export interface RouteStage {
  stageName: string
  rms: RouteMaterial[]
}

export interface RouteMaterial {
  type: "PRODUCT" | "ITEM" | "GROUP"
  code: string
  name: string
  ratio: number
}

export async function createProductAndRoute(
  page: Page,
  fgProductName: string,
): Promise<string> {
  // Click Create new routing button in routing panel
  await page.getByRole("button", { name: /create new routing/i }).click()
  await page.waitForSelector('[role="dialog"]', { state: "visible" })

  // Step 1: switch to "Create new product master" mode (default is "existing")
  await page.locator('[role="radio"][value="new"]').click()
  // Click Next to go to step 2
  await page.getByRole("button", { name: /^next$/i }).click()

  // Step 2: fill product name via placeholder (Label has no htmlFor)
  await page.getByPlaceholder(/PTY|product name/i).first().fill(fgProductName)

  // Select product type — only one role="combobox" on step 2
  await page.getByRole("combobox").click()
  await page.waitForSelector('[role="option"]', { state: "visible", timeout: 10000 })
  await page.getByRole("option").first().click()

  // Click "Create product + route"
  await page.getByRole("button", { name: /create product.*route/i }).click()

  // Wizard navigates to route editor at /finance/routes/[id]
  await page.waitForURL(/\/finance\/routes\/\d+/, { timeout: 15000 })
  const url = page.url()
  const match = url.match(/routes\/(\d+)/)
  return match?.[1] ?? ""
}

export async function promoteRoute(page: Page) {
  // Find and click promote button in routing panel or route editor
  const promoteBtn = page.getByRole("button", { name: /promote route|promote to request/i })
  await promoteBtn.click()

  // Confirm if needed
  const confirmBtn = page.getByRole("button", { name: /^(confirm|promote)$/i }).last()
  if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await confirmBtn.click()
  }

  await page.waitForLoadState("load")
  await expectStatus(page, "PARAMETER_PENDING")
}

// ─── Fill Tasks ───────────────────────────────────────────────────────────────

export async function openFillTrackingTab(page: Page) {
  const fillTab = page.getByRole("tab", { name: /fill tracking/i })
  await expect(fillTab).toBeVisible()
  await fillTab.click()
  await page.waitForLoadState("load")
}

export async function claimFillTask(page: Page, level: number) {
  const taskRow = page.locator(`[data-testid="fill-task-level-${level}"]`)
  await expect(taskRow).toBeVisible()
  await taskRow.getByRole("button", { name: /^claim$/i }).click()
  // Wait for status to transition away from ACTIVE (TanStack Query cache invalidation + refetch)
  await expect(taskRow.locator('[data-testid="task-status"]'))
    .not.toContainText("Active", { ignoreCase: true, timeout: 10000 })
}

export async function submitFillTask(page: Page, level: number) {
  const taskRow = page.locator(`[data-testid="fill-task-level-${level}"]`)
  await taskRow.getByRole("button", { name: /^submit$/i }).click()
  // Wait for status to transition away from FILLING (TanStack Query cache invalidation + refetch)
  await expect(taskRow.locator('[data-testid="task-status"]'))
    .not.toContainText("Filling", { ignoreCase: true, timeout: 10000 })
}

export async function approveFillTask(page: Page, level: number, note = "Approved") {
  const taskRow = page.locator(`[data-testid="fill-task-level-${level}"]`)
  await taskRow.getByRole("button", { name: /^approve$/i }).click()

  // Only interact with dialog if one actually appeared (some approvals are direct mutations)
  const dialog = page.locator('[role="dialog"]')
  const hasDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false)
  if (hasDialog) {
    const noteField = page.getByLabel(/note/i)
    if (await noteField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await noteField.fill(note)
    }
    await page.getByRole("button", { name: /^(confirm|approve)$/i }).last().click()
  }

  // Wait for status to transition away from APPROVAL_PENDING
  await expect(taskRow.locator('[data-testid="task-status"]'))
    .not.toContainText("Pending", { ignoreCase: true, timeout: 10000 })
}

export async function rejectFillTask(page: Page, level: number, reason: string) {
  const taskRow = page.locator(`[data-testid="fill-task-level-${level}"]`)
  await taskRow.getByRole("button", { name: /^reject$/i }).click()
  await page.getByLabel(/reason/i).fill(reason)
  await page.getByRole("button", { name: /^(confirm reject|reject)$/i }).last().click()
  // Wait for status to transition away from APPROVAL_PENDING
  await expect(taskRow.locator('[data-testid="task-status"]'))
    .not.toContainText("Pending", { ignoreCase: true, timeout: 10000 })
}

// ─── Assertions ───────────────────────────────────────────────────────────────

export async function expectStatus(page: Page, expectedStatus: string) {
  // Look for status badge — try multiple selector strategies
  const statusBadge = page.locator('[data-testid="request-status-badge"]')
    .or(page.locator('[class*="status"]').filter({ hasText: expectedStatus.replace("_", " ") }))
    .or(page.getByText(expectedStatus.replace(/_/g, " "), { exact: false }))
    .first()

  await expect(statusBadge).toBeVisible({ timeout: 8000 })
}

export async function expectButtonVisible(page: Page, name: string | RegExp) {
  await expect(page.getByRole("button", { name })).toBeVisible({ timeout: 10000 })
}

export async function expectButtonHidden(page: Page, name: string | RegExp) {
  await expect(page.getByRole("button", { name })).not.toBeVisible({ timeout: 10000 })
}

export async function expectNotificationBell(page: Page, minCount = 1) {
  const bell = page.locator('[data-testid="notification-bell"]')
  await expect(bell).toBeVisible()
  const badge = bell.locator('[data-testid="notification-badge"]')
  await expect(badge).toBeVisible({ timeout: 5000 })
  const text = await badge.textContent()
  const count = parseInt(text ?? "0", 10)
  expect(count).toBeGreaterThanOrEqual(minCount)
}

export async function expectFillTaskStatus(
  page: Page,
  level: number,
  expectedStatus: string,
) {
  const taskRow = page.locator(`[data-testid="fill-task-level-${level}"]`)
  await expect(taskRow).toBeVisible()
  await expect(taskRow.locator('[data-testid="task-status"]')).toContainText(
    expectedStatus.replace(/_/g, " "),
    { ignoreCase: true },
  )
}

// ─── Request List Helpers ─────────────────────────────────────────────────────

export async function findRequestInList(page: Page, title: string): Promise<string> {
  await gotoProductRequests(page)
  const row = page.getByRole("row").filter({ hasText: title }).first()
  await expect(row).toBeVisible({ timeout: 8000 })
  await row.click()
  await page.waitForURL(/product-requests\/\d+/)
  const match = page.url().match(/product-requests\/(\d+)/)
  return match?.[1] ?? ""
}

export async function waitForStatus(
  page: Page,
  expectedStatus: string,
  timeoutMs = 15000,
) {
  await page.waitForFunction(
    (status) => {
      const badges = document.querySelectorAll('[data-testid="request-status-badge"]')
      return Array.from(badges).some(
        (b) => b.textContent?.toLowerCase().includes(status.toLowerCase()),
      )
    },
    expectedStatus.replace(/_/g, " "),
    { timeout: timeoutMs },
  )
}
