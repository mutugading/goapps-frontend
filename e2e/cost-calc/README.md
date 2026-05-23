# Cost Calc Engine — Playwright E2E Specs (S8d.8)

> Status: **specs only** — Playwright is not yet installed in this repo.
> These files document the expected UI behavior for Phase C (Cost Calc Engine).
> They become runnable once `@playwright/test` is wired up per the steps below.

## Specs in this directory

| File | Coverage |
|------|----------|
| `01-trigger-single-product.spec.ts` | Trigger calc from product-master detail → reach job detail with status badge |
| `02-calc-jobs-page.spec.ts` | List page smoke: filter by status, open new-job dialog |
| `03-calc-job-detail-tabs.spec.ts` | Job detail page renders all 4 tabs (Overview / Products / Chunks / Audit) |
| `04-cost-results-viewer.spec.ts` | Cost results picker flow + 4-tab breakdown modal (Summary / By Level / RM / Formula Trace) |
| `05-permission-gating.spec.ts` | Low-perm user cannot see "New job" / "Calculate" buttons |
| `06-blocked-products-visible.spec.ts` | Products tab + BLOCKED filter render without error |

Each spec uses `test.skip()` to cleanly bail when dev-DB fixtures are missing
(e.g. no products seeded, no calc jobs yet, no `viewer` seeded user). This
makes the suite safe to run partial.

## Installation (when ready)

```bash
cd goapps-frontend
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

## Required `playwright.config.ts` (root of goapps-frontend)

```ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_NO_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        timeout: 120_000,
        reuseExistingServer: true,
      },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
})
```

## Required suggested `package.json` scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:calc": "playwright test e2e/cost-calc/",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Backend + infra prerequisites

These specs assume the full stack is running locally:

- PostgreSQL + Redis + RabbitMQ + MinIO via root `docker-compose.yaml`
- IAM service on `:50052` / `:8081`
- Finance service on `:50051` / `:8080`
- Finance orchestrator worker (consumes `cost.calc.trigger` queue)
- Frontend Next.js on `:3000`

## Seeded users referenced

See `helpers/login.ts`. Adjust credentials to match your dev seed:

- `admin@goapps.dev` — SUPER_ADMIN (used as `superadmin`)
- `finance@goapps.dev` — has `finance.cost.caljob.trigger`
- `viewer@goapps.dev` — lacks calc-trigger permission (for spec 05)

If `viewer` doesn't exist yet, spec 05 will skip with a TODO message — add
the seeded role in `goapps-backend/services/iam/migrations` before enabling.

## Running

```bash
# All Phase C UI specs:
npm run test:e2e:calc

# Single spec:
npx playwright test e2e/cost-calc/01-trigger-single-product.spec.ts

# Interactive UI:
npm run test:e2e:ui
```

## Related plans

- `E2E_LIFECYCLE_PLAN.md` (repo root) — full lifecycle plan including these
  Phase C specs alongside the Phase B request/route/product-order suite.
- `PLAN_PHASE_C_CALC_ENGINE.md` (or session memo) — S8d.8 task definition.
