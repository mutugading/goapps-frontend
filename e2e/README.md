# BI Executive Dashboard — Playwright E2E

End-to-end specs for the viewer (drill/compare) and the admin wizard (zero-JSON create flow).

## Prerequisites

These specs drive the **real, running stack** — they are NOT hermetic.

1. **Backend up with migrations applied:**
   - finance gRPC `:50051` (+ HTTP gateway `:8080`) with migrations `000300–000314` applied
     (provides `bi_*` tables, the 2 reference dashboards `EBITDA`/`NET_PROFIT`, and 288 demo
     fact rows).
   - IAM gRPC `:50052` with migration `000015` applied (BI permissions + menus + SUPER_ADMIN
     role grants).
   - Redis + (optionally) RabbitMQ from `docker compose up -d`.
2. **Frontend up** on `E2E_BASE_URL` (default `http://localhost:3000`): `npm run dev` or
   `npm run build && npm start`.
3. **A seeded admin login.** Credentials via env:
   - `E2E_USER` (default `admin`)
   - `E2E_PASSWORD` (falls back to `SEED_ADMIN_PASSWORD`, else `admin`)
4. **Browser binary (first run only):** `npx playwright install chromium`.

## Run

```bash
# from goapps-frontend/
E2E_USER=admin E2E_PASSWORD=<seed-admin-pw> npm run test:e2e
# interactive:
npm run test:e2e:ui
```

`e2e/global-setup.ts` logs in once via the login form and saves the authenticated session
to `e2e/.auth/state.json` (git-ignored); every spec reuses it.

## Specs

| File | Covers |
|---|---|
| `bi-viewer.spec.ts` | landing lists dashboards → navigate to EBITDA viewer → KPIs + chart render → compare=YoY reflected in URL → period preset via URL |
| `bi-admin-wizard.spec.ts` | admin tabs render → 7-step wizard creates a bar dashboard (zero-JSON: dropdowns only) → new code appears in the admin list |

## Notes

- Specs run serially (`workers: 1`) because the wizard test mutates shared dashboard state.
- The compare/drill assertions are best-effort on chart internals (ECharts renders to
  `<canvas>`); they assert the chart element + URL state rather than pixel content.
- CI integration is deferred: wire these into a workflow that boots the stack (compose +
  migrate + seed) before `npm run test:e2e`.
