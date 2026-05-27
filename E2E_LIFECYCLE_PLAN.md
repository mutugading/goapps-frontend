# Costing Lifecycle — End-to-End Test Plan

> Drafted in S7.10 (2026-05-21). Backend unit tests for new packages already
> ship in this branch; the full Playwright spec is the remaining piece.
>
> This document is the spec to implement. Setup is intentionally listed first
> so the test author can scaffold once and re-use across all flows.

---

## 0. Setup

### Install

```bash
cd goapps-frontend
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

### `playwright.config.ts`

- `baseURL`: `http://localhost:3000`
- `testDir`: `tests/e2e`
- `webServer`: spawn `npm run dev` if not already running
- `use.storageState`: `tests/e2e/.auth/admin.json` (created by global setup)
- Run finance + iam backends + Postgres + MinIO via `docker compose up -d` in
  repo root before the suite starts.

### Global setup — `tests/e2e/global.setup.ts`

1. POST `/api/v1/iam/auth/login` with `{email: "admin@goapps.dev", password: "admin123"}`.
2. Save cookies into `tests/e2e/.auth/admin.json` for re-use across specs.

### Database hygiene

Each spec should clean up after itself rather than rely on global truncation —
backend has no test-mode DB swap. Use unique codes (`E2E-${Date.now()}-XX`) so
parallel runs don't collide.

---

## 1. Specs (one file per flow)

### `tests/e2e/01-product-master.spec.ts`

Covers the CAPP applicability flow (S7.6) + Parameters tab UX.

1. Sign in (via storageState).
2. Navigate `/finance/product-master` → click "Create product" → fill code +
   name + type + shade + grade → submit.
3. Click the new product's code in the table → arrive at detail page.
4. Tab "Parameters" → assert empty-state CTA visible.
5. Click "Add parameter" → search "SPEED" → toggle Required ON → Add.
6. Repeat for "DENIER" (Required ON) and "DENIER_OUT" (Required OFF, since
   CALCULATED is engine-filled).
7. Assert badge reads "Missing 2 required" (SPEED + DENIER unbound; DENIER_OUT
   excluded because CALCULATED).
8. Fill SPEED = 100, DENIER = 75 → Save changes → assert badge reads "All
   required params filled".
9. Click Remove (trash) on DENIER_OUT → assert it disappears from the list.

### `tests/e2e/02-product-request-lifecycle.spec.ts`

Covers the full request state machine (S4 → S7.8).

1. Navigate `/finance/product-requests` → "New request".
2. Pick request type RND, classification NEW, fill title/customer/urgency,
   fill the spec section (raw material, description, paper tube, weight,
   shade, box type) → save (state = DRAFT).
3. On detail page: click Submit → assert StatusBadge becomes `SUBMITTED`.
4. Click Start review → assert `UNDER_REVIEW`.
5. Click Verify classification → keep as NEW → confirm.
6. Click Decide feasibility → FEASIBLE → confirm → assert `ROUTING_DEFINED`.
7. In "Routing drafts" panel click New draft → ProductMasterCombobox picker
   → pick the product created in spec 01.
8. Add a component row → toggle "Pick" mode → pick a different product master
   (RM) → Save.
9. Try Promote with no components first (delete the only row and Save) →
   expect toast `promote requires at least one routing component`.
10. Re-add the row + Save → Promote → "Link to existing" → pick the target
    product → expect success → Order #N appears.
11. Try Promote AGAIN on a new draft to the same product → expect toast
    `target product already has an active product order`.

### `tests/e2e/03-existing-product-flow.spec.ts`

Covers S7.8 UseExistingCosting picker.

1. Create a request with classification = EXISTING (no spec needed).
2. Submit → Start review → Verify classification (EXISTING).
3. Click "Use existing costing" → assert dialog opens with
   ProductMasterCombobox.
4. Try to confirm without picking → button disabled.
5. Pick a product → Confirm → assert StatusBadge becomes `QUOTE_READY` and
   the dialog closes.
6. On detail card, assert that the "Existing product" field shows the picked
   product (this requires the detail panel to surface it — small follow-up
   if the field isn't rendered yet).

### `tests/e2e/04-attachments-and-comments.spec.ts`

Covers S7.9 attachment inline preview + comment composer + admin gating.

1. On a request detail page, scroll to Comments panel.
2. Type "First @admin look at this" in the composer.
3. Click "Attach files" → upload `tests/e2e/fixtures/sample.png`.
4. Assert staged file appears in the list with X remove button.
5. Click Post → assert new comment appears with the attachment under it.
6. Click the attachment filename → new tab opens with `content-disposition=inline`
   in the URL (preview, not download). For a `.xlsx` fixture, expect download.
7. Hover over comment author — tooltip shows the original UUID; body text
   shows the resolved full name (UserName component).
8. Hide button: when logged in as admin, click Hide → comment becomes
   greyed-out. Log out, log in as non-admin → assert Hide button is gone.
9. Edit/Delete: only the author OR an admin sees those buttons.

### `tests/e2e/05-bigint-regression.spec.ts`

Guards the BigInt-undefined regression fixed in S7.7.

1. Open a routing draft.
2. Add a row, leave sub-sequence empty, fill seq + rm_type + rm_ref → Save.
3. Assert no error toast (previously: "Cannot convert undefined to a BigInt").
4. Open a product order, add a component with optional fields left empty →
   Save draft. Same assertion.

---

## 2. Fixtures

- `tests/e2e/fixtures/sample.png` — small inline-previewable image.
- `tests/e2e/fixtures/sample.pdf` — small PDF (inline preview).
- `tests/e2e/fixtures/sample.xlsx` — Excel (force-download).
- `tests/e2e/fixtures/sample.txt` — text (inline preview).

---

## 3. Running

```bash
# headless
npx playwright test

# headed (good for debugging the flows above)
npx playwright test --headed

# single spec
npx playwright test 02-product-request-lifecycle

# generate selectors interactively
npx playwright codegen http://localhost:3000
```

## 4. CI integration (later)

- Bring up `docker compose up -d` in a CI step.
- Wait for `:8081/health` (IAM) and `:8080/health` (finance).
- `npm run dev &` in background, wait for `:3000`.
- `npx playwright test --reporter=html`.
- Upload `playwright-report/` as a CI artifact.
