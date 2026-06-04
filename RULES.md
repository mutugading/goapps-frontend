# Frontend Development Rules

Guidelines and conventions for all frontend developers working on `goapps-frontend`.

> **Version:** 2.0.0
> **Last Updated:** June 2026
> **Applies to:** All Frontend Developers

---

## Table of Contents

1. [Golden Rules](#1-golden-rules)
2. [Project Structure](#2-project-structure)
3. [File & Folder Naming](#3-file--folder-naming)
4. [Page Development](#4-page-development)
5. [Responsiveness](#5-responsiveness)
6. [Typography & Spacing](#6-typography--spacing)
7. [Components](#7-components)
8. [KPI Cards & Stats](#8-kpi-cards--stats)
9. [Charts](#9-charts)
10. [Data Tables](#10-data-tables)
11. [Forms & Dialogs](#11-forms--dialogs)
12. [Filters & Search](#12-filters--search)
13. [State Management](#13-state-management)
14. [Hooks & Data Fetching](#14-hooks--data-fetching)
15. [BFF API Routes](#15-bff-api-routes)
16. [Response Normalization](#16-response-normalization)
17. [Error Handling](#17-error-handling)
18. [Alerts & Banners](#18-alerts--banners)
19. [Navigation & Routing](#19-navigation--routing)
20. [Permissions (RBAC)](#20-permissions-rbac)
21. [TypeScript](#21-typescript)
22. [Styling & Dark Mode](#22-styling--dark-mode)
23. [Performance](#23-performance)
24. [Accessibility](#24-accessibility)
25. [Git Workflow](#25-git-workflow)
26. [Pre-commit Checklist](#26-pre-commit-checklist)

---

## 1. Golden Rules

> These rules are non-negotiable. Zero exceptions.

### 1.1 Never modify `components/ui/`

Files in `components/ui/` are managed by the shadcn CLI and will be overwritten on the next `npx shadcn add`. Create wrappers in `components/common/` instead.

```tsx
// WRONG — DO NOT TOUCH src/components/ui/button.tsx
// CORRECT — create a wrapper
// src/components/common/submit-button.tsx
import { Button } from "@/components/ui/button"
export function SubmitButton({ children, loading, ...props }) {
  return <Button type="submit" disabled={loading} {...props}>{loading ? "Saving..." : children}</Button>
}
```

### 1.2 Every page with data fetching needs `loading.tsx`

```tsx
// app/(dashboard)/finance/uom/loading.tsx
import { TableSkeleton } from "@/components/loading"
export default function Loading() {
  return <TableSkeleton rows={5} />
}
```

### 1.3 Always use `@/` import alias — never relative paths

```tsx
// WRONG
import { Button } from "../../../components/ui/button"
// CORRECT
import { Button } from "@/components/ui/button"
```

### 1.4 `"use client"` only when needed

Server Components are faster and the default. Only add `"use client"` for components using hooks, browser events, or client-only APIs.

### 1.5 Zero TypeScript and lint errors before every commit

```bash
npx tsc --noEmit   # 0 errors
npm run lint       # 0 errors
npm run build      # must succeed
```

### 1.6 Never expose raw UUIDs to users

No UUID in form inputs, table columns, breadcrumbs, or any user-visible text. Resolve to human-readable labels (ticket_no, product_code, name). Use lookup pickers instead of text inputs for ID fields.

### 1.7 Never skip TypeScript types

Every function parameter, prop, and state variable must be typed. No `any`.

---

## 2. Project Structure

```
goapps-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Auth route group (login, forgot-password)
│   │   ├── (dashboard)/              # Dashboard route group (sidebar + header)
│   │   │   ├── layout.tsx            # SidebarProvider + AppSidebar + Header
│   │   │   ├── page.tsx              # CMS landing page (/)
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── finance/              # Finance module pages
│   │   │   │   ├── bi/               # Executive Dashboards
│   │   │   │   ├── master/           # UOM, parameters, RM categories
│   │   │   │   ├── product-requests/ # Product costing requests
│   │   │   │   ├── product-routes/   # Routing / BOM
│   │   │   │   ├── calculation-jobs/ # Calc job monitor
│   │   │   │   ├── cost-results/     # Costing results
│   │   │   │   ├── cost-stock-po/    # Stock + PO cost data
│   │   │   │   └── product-master/   # Product catalog
│   │   │   └── iam/                  # IAM module pages
│   │   │       ├── users/
│   │   │       ├── roles/
│   │   │       ├── permissions/
│   │   │       ├── organizations/
│   │   │       ├── menus/
│   │   │       ├── sessions/
│   │   │       └── audit-logs/
│   │   └── api/v1/                   # BFF API routes
│   │       ├── finance/              # Finance BFF endpoints
│   │       └── iam/                  # IAM BFF endpoints
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives — DO NOT MODIFY
│   │   ├── common/                   # Shared app-wide components
│   │   ├── shared/                   # Reusable feature building blocks
│   │   ├── charts/                   # Recharts wrappers (AreaChart, BarChart, PieChart)
│   │   ├── loading/                  # Skeleton loaders
│   │   ├── finance/                  # Finance module components
│   │   ├── iam/                      # IAM module components
│   │   └── bi/                       # BI / Executive dashboard components
│   ├── hooks/                        # Custom React hooks
│   │   ├── finance/                  # Finance CRUD hooks
│   │   └── iam/                      # IAM CRUD hooks
│   ├── services/                     # API service functions (call BFF)
│   ├── types/                        # TypeScript types + normalizers
│   │   ├── generated/                # Proto-generated (DO NOT EDIT)
│   │   ├── finance/                  # Finance normalized types
│   │   └── iam/                      # IAM normalized types
│   ├── lib/
│   │   ├── grpc/                     # gRPC client factory + error utils
│   │   ├── hooks/                    # Generic hooks (use-url-state, use-debounce)
│   │   └── ui/                       # typography.ts, status-colors.ts
│   ├── stores/                       # Zustand stores (sidebar, auth)
│   ├── providers/                    # React context providers
│   └── config/                       # Site config + navigation
├── RULES.md                          # This file
├── CONTRIBUTING.md
└── docs/                             # Additional documentation
```

---

## 3. File & Folder Naming

| Item | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `uom-form-dialog.tsx` |
| Page | `page.tsx` | `app/(dashboard)/finance/uom/page.tsx` |
| Page client | `{module}-page-client.tsx` | `uom-page-client.tsx` |
| Loading | `loading.tsx` | `app/(dashboard)/finance/uom/loading.tsx` |
| Error | `error.tsx` | `app/(dashboard)/finance/uom/error.tsx` |
| Layout | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Hook | `use-{name}.ts` | `use-uom.ts`, `use-url-state.ts` |
| Service | `{name}-api.ts` | `uom-api.ts` |
| Type file | `{name}.ts` | `types/finance/uom.ts` |
| Barrel | `index.ts` | `components/common/index.ts` |
| Config | `kebab-case.ts` | `navigation.ts`, `site.ts` |

**Component names** (exported symbols): `PascalCase` — `UOMFormDialog`, `DataTable`, `KpiCard`.

**Folder names**: `kebab-case` — `form-dialog/`, `data-table/`, `cost-stock-po/`.

**Module-prefix components**: prefix component files with their module:

```
components/finance/uom/
├── index.ts
├── uom-form-dialog.tsx
├── uom-delete-dialog.tsx
├── uom-import-dialog.tsx
├── uom-filters.tsx
├── uom-table.tsx
└── uom-pagination.tsx
```

---

## 4. Page Development

### 4.1 Server page → Client page pattern

Split every page that needs hooks/state into two files:

```tsx
// app/(dashboard)/finance/uom/page.tsx — server component
import { generateMetadata as genMeta } from "@/config/site"
import UOMPageClient from "./uom-page-client"

export const metadata = genMeta("Unit of Measure")
export const dynamic = "force-dynamic" // if data must be fresh every request

export default function UOMPage() {
  return <UOMPageClient />
}
```

```tsx
// app/(dashboard)/finance/uom/uom-page-client.tsx — client component
"use client"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/loading"

export default function UOMPageClient() {
  return (
    <Suspense fallback={<TableSkeleton rows={5} />}>
      <UOMPageContent />
    </Suspense>
  )
}

// Inner component uses hooks (useSearchParams, useUrlState, etc.)
function UOMPageContent() {
  const [filters, setFilters] = useUrlState(...)
  // ...
}
```

> `useSearchParams` must be inside a `<Suspense>` boundary — hence the inner component pattern.

### 4.2 Standard page shell structure

```tsx
export default function UOMPageContent() {
  return (
    <div>
      <PageHeader title="Unit of Measure" subtitle="Manage units of measure">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add UOM
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Optional: under-development banner */}
        {/* KPI stats row */}
        {/* Filters card */}
        {/* Data table card */}
        {/* Pagination */}
      </div>
    </div>
  )
}
```

**Key rule:** `PageHeader` is **outside** the `space-y-*` wrapper. `PageHeader` has built-in `pb-6` bottom padding. Putting it inside a `space-y-6` wrapper doubles the gap between title and content.

### 4.3 loading.tsx — required for all data pages

```tsx
// app/(dashboard)/finance/uom/loading.tsx
import { TableSkeleton } from "@/components/loading"
export default function Loading() { return <TableSkeleton rows={5} /> }
```

Available skeletons from `@/components/loading`:

| Skeleton | Usage |
|----------|-------|
| `PageSkeleton` | Full page with header, cards, charts |
| `CardSkeleton` | Single stat card |
| `ChartSkeleton` | Chart card placeholder |
| `TableSkeleton` | Data table rows (`rows` prop) |
| `DashboardSkeleton` | Complete dashboard layout |
| `SidebarSkeleton` | Sidebar navigation |

### 4.4 error.tsx — for pages that can fail

```tsx
// app/(dashboard)/finance/uom/error.tsx
"use client"
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p className="text-destructive">{error.message || "Something went wrong"}</p>
      <Button onClick={reset} variant="outline">Try again</Button>
    </div>
  )
}
```

---

## 5. Responsiveness

### 5.1 Mobile-first — always

Write mobile styles first, then override with breakpoint prefixes.

```tsx
// WRONG — desktop only
<div className="grid grid-cols-4">

// CORRECT — mobile first
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

Tailwind breakpoints in use:

| Prefix | Min-width | Device |
|--------|-----------|--------|
| *(none)* | 0px | Mobile |
| `sm:` | 640px | Large phones / landscape |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

### 5.2 Grid items containing charts MUST have `min-w-0`

CSS grid items have `min-width: auto` by default. Without `min-w-0`, a chart's `ResponsiveContainer` can cause the grid column to expand beyond its allocated width, pushing adjacent columns off-screen.

```tsx
// WRONG — will overflow on large screens / push pie chart off-screen
<Card className="lg:col-span-2">
  <AreaChart ... />
</Card>

// CORRECT — always add min-w-0 to grid items with charts
<Card className="min-w-0 lg:col-span-2">
  <AreaChart ... />
</Card>
```

### 5.3 Standard responsive grid patterns

**4-column KPI stats:**
```tsx
<KpiGrid cols={4}>        {/* 1→2→4 columns */}
  <KpiCard ... />
  <KpiCard ... />
</KpiGrid>
```

**Wide chart + narrow chart (2/3 + 1/3):**
```tsx
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <Card className="min-w-0 lg:col-span-2">  {/* area chart */} </Card>
  <Card className="min-w-0 lg:col-span-1">  {/* donut chart */} </Card>
</div>
```

**Two equal columns:**
```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <Card> ... </Card>
  <Card> ... </Card>
</div>
```

**Filter bar (search + selects):**
```tsx
<div className="flex flex-col gap-3 md:flex-row md:items-center">
  <DebouncedSearchInput ... />
  <Select ... />
  <Select ... />
</div>
```

**Row that stacks on mobile:**
```tsx
<div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p className="text-sm font-medium">{label}</p>
    <p className="text-xs text-muted-foreground">{sub}</p>
  </div>
  <div className="flex items-center gap-2 sm:gap-4">
    <Badge>{tag}</Badge>
    <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
  </div>
</div>
```

### 5.4 Minimum test viewports

Before marking a page done, verify at:
- **390px** — iPhone 14
- **768px** — iPad
- **1280px** — laptop
- **1440px** — desktop

---

## 6. Typography & Spacing

### 6.1 Use `typography` constants — never hardcode classes

All text sizing is centralized in `src/lib/ui/typography.ts`.

```tsx
import { typography } from "@/lib/ui/typography"

<h1 className={typography.pageTitle}>Unit of Measure</h1>
<p className={typography.subtitle}>Manage units of measure</p>
<div className={typography.metric}>1,234</div>
<span className={typography.metricDelta}>+8.2% from last month</span>
<th className={typography.tableHeader}>Code</th>
<td className={typography.tableCell}>{row.code}</td>
<code className={typography.mono}>UOM-001</code>
```

| Constant | Classes | When to use |
|----------|---------|-------------|
| `pageTitle` | `text-xl font-bold tracking-tight md:text-2xl` | Page H1 |
| `sectionTitle` | `text-base font-semibold md:text-lg` | Section / card headings |
| `cardTitle` | `text-sm font-medium text-muted-foreground` | Card header label |
| `subtitle` | `text-sm text-muted-foreground` | Page or card subtitles |
| `metric` | `text-2xl font-bold tabular-nums md:text-3xl` | Large KPI numbers |
| `metricDelta` | `text-xs text-muted-foreground` | Delta line below KPI |
| `tableHeader` | `text-xs font-medium uppercase tracking-wide text-muted-foreground` | `<th>` cells |
| `tableCell` | `text-sm` | `<td>` cells |
| `mono` | `font-mono text-xs` | Codes, IDs, technical values |

### 6.2 Vertical spacing between content blocks

Use `space-y-6` between major sections. Use `space-y-4` within a section.

```tsx
{/* Outer container — PageHeader sits outside */}
<div>
  <PageHeader ... />

  <div className="space-y-6">
    <Alert ... />         {/* Under-development banner (if needed) */}
    <KpiGrid cols={4}>    {/* Stats row */}
    <div className="grid ...">  {/* Charts */}
    <Card>                {/* Table */}
  </div>
</div>
```

### 6.3 Card internal spacing

Use `space-y-4` inside `CardContent` to separate filters, table, and pagination:

```tsx
<CardContent className="space-y-4">
  <UOMFilters ... />
  <UOMTable ... />
  <UOMPagination ... />
</CardContent>
```

---

## 7. Components

### 7.1 Component directory by type

| Directory | Contents | Rules |
|-----------|----------|-------|
| `components/ui/` | shadcn primitives | **DO NOT MODIFY** |
| `components/common/` | App-wide shared (PageHeader, KpiCard, etc.) | Wrap `ui/` here |
| `components/shared/` | Feature building blocks (DataTable, FormDialog, etc.) | Generic, no module logic |
| `components/charts/` | Recharts wrappers | See Section 9 |
| `components/loading/` | Skeleton loaders | Export from index.ts |
| `components/finance/` | Finance module components | Module-prefixed filenames |
| `components/iam/` | IAM module components | Module-prefixed filenames |
| `components/bi/` | BI / Executive dashboard | Module-prefixed filenames |

### 7.2 Always create `index.ts` barrel exports

```ts
// components/common/index.ts
export { PageHeader } from "./page-header"
export { DynamicBreadcrumb } from "./dynamic-breadcrumb"
export { KpiCard } from "./kpi-card"
export { KpiGrid } from "./kpi-grid"
export { EmptyState } from "./empty-state"
export { StatusBadge } from "./status-badge"
export { DebouncedSearchInput } from "./debounced-search-input"
export { ScrollableDialog } from "./scrollable-dialog"
```

Import from the barrel, not direct file paths:

```tsx
// CORRECT
import { PageHeader, KpiCard, EmptyState } from "@/components/common"

// AVOID — verbose, breaks if file moves
import { PageHeader } from "@/components/common/page-header"
```

### 7.3 Available `components/common/` exports

| Component | Props summary | When to use |
|-----------|---------------|-------------|
| `PageHeader` | `title`, `subtitle`, `children` (actions) | Top of every page |
| `DynamicBreadcrumb` | *(none — auto from URL)* | Layout header (already there) |
| `KpiCard` | `title`, `value`, `icon`, `variant`, `delta`, `loading`, `href` | Stat tiles |
| `KpiGrid` | `cols` (2/3/4), `children` | Wraps KpiCards |
| `EmptyState` | `title`, `description`, `icon`, `action` | No-data state |
| `StatusBadge` | `status`, `type`, `size` | Status pills in tables |
| `DebouncedSearchInput` | `value`, `onValueChange`, `placeholder`, `debounceMs` | Search with URL sync |
| `ScrollableDialog` | `open`, `onOpenChange`, `title`, `children` | Forms in modals on mobile |

### 7.4 Available `components/shared/` exports

| Component | When to use |
|-----------|-------------|
| `DataTable` | All list pages with sortable/actionable rows |
| `DataTablePagination` | Pagination control below DataTable |
| `ConfirmDialog` | Delete / destructive action confirmation |
| `FormDialog` | Generic dialog shell for form content |
| `SearchFilters` | Advanced multi-filter UI |
| `ErrorBoundary` / `ErrorFallback` | Catch render errors |

### 7.5 Component import order convention

```tsx
// 1. React
import { useState, useEffect } from "react"
// 2. Next.js
import Link from "next/link"
import { useRouter } from "next/navigation"
// 3. Third-party (alphabetical)
import { toast } from "sonner"
import { Plus, Download } from "lucide-react"
// 4. shadcn/ui
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// 5. Common / shared components
import { PageHeader, KpiCard, KpiGrid } from "@/components/common"
import { DataTable, DataTablePagination } from "@/components/shared"
// 6. Feature components
import { UOMFormDialog, UOMFilters } from "@/components/finance/uom"
// 7. Hooks
import { useUOMs, useCreateUOM } from "@/hooks/finance/use-uom"
import { useUrlState } from "@/lib/hooks"
// 8. Types
import type { UOM } from "@/types/finance/uom"
// 9. Utils / config
import { typography } from "@/lib/ui/typography"
import { generateMetadata as genMeta } from "@/config/site"
```

---

## 8. KPI Cards & Stats

### 8.1 Always use `KpiCard` + `KpiGrid`

Never build raw `<Card>` stat tiles. Use the reusable `KpiCard` + `KpiGrid`.

```tsx
import { KpiCard, KpiGrid } from "@/components/common"
import { FileText, Inbox, CheckCircle2, Clock } from "lucide-react"

<KpiGrid cols={4}>
  <KpiCard
    title="Total Requests"
    value={counts?.total ?? 0}
    icon={FileText}
    loading={countsLoading}
  />
  <KpiCard
    title="Open"
    value={counts?.open ?? 0}
    icon={Inbox}
    variant="warning"
    loading={countsLoading}
  />
  <KpiCard
    title="Completed"
    value={counts?.completed ?? 0}
    icon={CheckCircle2}
    variant="success"
    loading={countsLoading}
  />
  <KpiCard
    title="Avg. Days"
    value={counts?.avgDays ?? 0}
    icon={Clock}
    delta={{ value: -1.2, label: "vs last month", trend: "down" }}
    loading={countsLoading}
  />
</KpiGrid>
```

### 8.2 KpiCard variants

| Variant | Accent color | When to use |
|---------|-------------|-------------|
| `default` | Neutral | Generic counts |
| `success` | Emerald | Positive metrics, completions |
| `warning` | Amber | Pending, caution |
| `destructive` | Red | Errors, failures |

### 8.3 KpiCard with link

```tsx
<KpiCard
  title="Active Sessions"
  value={156}
  icon={Activity}
  href="/iam/sessions"    // makes the whole card a link
/>
```

### 8.4 KpiGrid column options

| `cols` | Breakpoints | When to use |
|--------|-------------|-------------|
| `4` | 1→2→4 | Standard 4-stat dashboard row |
| `3` | 1→2→3 | 3-metric overview |
| `2` | 1→2 | Two paired metrics |

---

## 9. Charts

### 9.1 `min-w-0` is mandatory on grid items containing charts

Without `min-w-0`, `ResponsiveContainer` can expand the grid column beyond its allocated width, causing adjacent cards to render off-screen.

```tsx
// CORRECT — always
<Card className="min-w-0 lg:col-span-2">
  ...chart...
</Card>
```

### 9.2 Wrap charts in an explicit-height div

`ResponsiveContainer` requires its immediate parent to have a defined height. Wrap every chart in `<div className="h-[Npx] w-full">`.

```tsx
<CardContent>
  <div className="h-[260px] w-full">
    <AreaChart data={data} xAxisKey="month" series={series} className="h-full" />
  </div>
</CardContent>
```

Do **not** rely on `flex-1` or `height: 100%` from flex children — percentage heights do not resolve reliably inside flex items across all browsers.

### 9.3 Do NOT use shadcn `ChartContainer` for layout-sensitive charts

`ChartContainer` applies `aspect-video` (16:9) by default. Combined with explicit height, the browser computes a fixed pixel width from the ratio, overflowing the card on small screens. Use `ResponsiveContainer` directly.

```tsx
// WRONG — aspect-video causes overflow on mobile
<ChartContainer config={config} className="h-[260px]">...</ChartContainer>

// CORRECT — direct ResponsiveContainer inside a sized div
<div className="h-[260px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <RechartsAreaChart>...</RechartsAreaChart>
  </ResponsiveContainer>
</div>
```

### 9.4 Use fixed pixel radii for Pie/Donut

Percentage string radii (`"40%"`) are unreliable in recharts 2.x within SSR and hydration contexts. Use fixed pixel values.

```tsx
// WRONG
<Pie innerRadius="40%" outerRadius="65%" ... />

// CORRECT
<Pie innerRadius={55} outerRadius={85} ... />
```

### 9.5 Custom HTML legend — do not use recharts `<Legend />`

The built-in `<Legend />` causes layout overflow inside fixed-height chart containers. Replace with a custom HTML legend below the chart div.

```tsx
<div className="h-[200px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <RechartsPieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} ... >
        {data.map((e, i) => <Cell key={i} fill={e.color} />)}
      </Pie>
    </RechartsPieChart>
  </ResponsiveContainer>
</div>
{/* Custom legend — no overflow */}
<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-1 pt-2">
  {data.map(item => (
    <div key={item.name} className="flex items-center gap-1.5 min-w-0">
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
      <span className="truncate text-xs text-muted-foreground">{item.name}</span>
      <span className="ml-auto shrink-0 text-xs font-medium tabular-nums">{item.pct}%</span>
    </div>
  ))}
</div>
```

### 9.6 Explicit `strokeWidth` on Area charts

Recharts applies `fill-opacity` to both the fill area **and** the stroke path. Without explicit `strokeWidth`, the line is nearly invisible.

```tsx
<Area
  stroke={color}
  strokeWidth={2}      // explicit — prevents near-invisible stroke
  fill={color}
  fillOpacity={0.15}   // light fill; stroke stays opaque
/>
```

### 9.7 Tooltip styling — use CSS variables for dark mode

```tsx
<Tooltip
  contentStyle={{
    borderRadius: "8px",
    fontSize: "12px",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    color: "hsl(var(--card-foreground))",
  }}
/>
```

### 9.8 Standard chart heights

| Chart type | Recommended height | Container class |
|------------|--------------------|-----------------|
| Area / Bar — wide card (2/3 col) | 260–300px | `h-[260px]` |
| Area / Bar — full-width card | 300–350px | `h-[300px]` |
| Donut / Pie — narrow card (1/3 col) | 200px | `h-[200px]` |
| Sparkline inline | 60px | `h-[60px]` |

---

## 10. Data Tables

### 10.1 Use the shared `DataTable` component

```tsx
import { DataTable, DataTablePagination } from "@/components/shared"

<DataTable<UOM>
  data={items}
  columns={columns}
  keyField="uomId"
  isLoading={isLoading}
  actions={[
    { label: "Edit", onClick: handleEdit },
    { label: "Delete", onClick: handleDelete },
  ]}
  stickyActions={true}
  tableId="uom-table"
/>

<DataTablePagination
  currentPage={pagination?.currentPage ?? 1}
  pageSize={pagination?.pageSize ?? 20}
  totalItems={totalItems}
  totalPages={pagination?.totalPages ?? 0}
  onPageChange={(page) => setFilters({ ...filters, page })}
  onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
/>
```

### 10.2 Column definition pattern

```tsx
import type { ColumnDef } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/common"
import { typography } from "@/lib/ui/typography"

const columns: ColumnDef<UOM>[] = [
  {
    id: "uomCode",
    header: "Code",
    cell: (info) => (
      <span className={typography.mono}>{info.row.original.uomCode}</span>
    ),
  },
  {
    id: "uomName",
    header: "Name",
    cell: (info) => (
      <span className={typography.tableCell}>{info.row.original.uomName}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (info) => (
      <StatusBadge status={info.row.original.status} type="request" />
    ),
  },
]
```

### 10.3 Empty state inside tables

```tsx
import { EmptyState } from "@/components/common"

{!isLoading && items.length === 0 && (
  <EmptyState
    title="No units of measure found"
    description="Try adjusting your search or filters."
  />
)}
```

### 10.4 Error state in lists

```tsx
{isError && (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
    {error instanceof Error ? error.message : "Failed to load data"}
  </div>
)}
```

---

## 11. Forms & Dialogs

### 11.1 React Hook Form + Zod — always

```tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  uomCode: z.string().min(1, "Code is required").max(20),
  uomName: z.string().min(1, "Name is required").max(100),
  isActive: z.boolean().default(true),
})
type FormValues = z.infer<typeof schema>
```

### 11.2 Form dialog structure

```tsx
export function UOMFormDialog({
  open,
  onOpenChange,
  uom,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom?: UOM | null
}) {
  const isEditing = !!uom
  const createMutation = useCreateUOM()
  const updateMutation = useUpdateUOM()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { uomCode: "", uomName: "", isActive: true },
  })

  // Reset form when opening for edit
  useEffect(() => {
    if (open) {
      form.reset(uom ? { uomCode: uom.uomCode, uomName: uom.uomName, isActive: uom.isActive } : {})
    }
  }, [open, uom, form])

  async function onSubmit(values: FormValues) {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: uom!.uomId, data: values })
    } else {
      await createMutation.mutateAsync(values)
    }
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Add"} Unit of Measure</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* form fields */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 11.3 Dialog state management in page client

```tsx
const [isFormOpen, setIsFormOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<UOM | null>(null)
const [isDeleteOpen, setIsDeleteOpen] = useState(false)

function handleCreate() {
  setSelectedItem(null)    // null = create mode
  setIsFormOpen(true)
}

function handleEdit(uom: UOM) {
  setSelectedItem(uom)     // non-null = edit mode
  setIsFormOpen(true)
}

function handleDelete(uom: UOM) {
  setSelectedItem(uom)
  setIsDeleteOpen(true)
}
```

### 11.4 Use `ScrollableDialog` for mobile-friendly modals

```tsx
import { ScrollableDialog } from "@/components/common/scrollable-dialog"

<ScrollableDialog open={open} onOpenChange={onOpenChange} title="Create UOM">
  <form>...</form>
</ScrollableDialog>
```

### 11.5 No raw UUID inputs — always use lookup pickers

```tsx
// WRONG — user must type a UUID
<Input placeholder="Enter product ID..." onChange={e => setId(e.target.value)} />

// CORRECT — user searches by name, ID resolved internally
<ProductCombobox
  value={selectedProductId}
  onSelect={(product) => setValue("productId", product.productSysId)}
/>
```

### 11.6 Delete confirmation always uses `ConfirmDialog`

```tsx
import { ConfirmDialog } from "@/components/shared"

<ConfirmDialog
  open={isDeleteOpen}
  onOpenChange={setIsDeleteOpen}
  title="Delete UOM"
  description={`Are you sure you want to delete "${selectedItem?.uomName}"? This cannot be undone.`}
  onConfirm={() => deleteMutation.mutate(selectedItem!.uomId)}
  isLoading={deleteMutation.isPending}
/>
```

---

## 12. Filters & Search

### 12.1 Always use `DebouncedSearchInput` for text search

Never use a raw `<input>` that syncs to URL state directly. Debouncing prevents excessive re-renders and URL pushes on every keystroke.

```tsx
import { DebouncedSearchInput } from "@/components/common"

<DebouncedSearchInput
  value={filters.search || ""}
  onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
  placeholder="Search by request #, title, or customer…"
  debounceMs={300}
/>
```

### 12.2 Filter bar layout

```tsx
<div className="flex flex-col gap-3 md:flex-row md:items-center">
  <DebouncedSearchInput className="md:w-64" ... />
  <Select value={filters.status || "ALL"} onValueChange={(v) =>
    setFilters({ ...filters, status: v === "ALL" ? "" : v, page: 1 })
  }>
    <SelectTrigger className="md:w-48">
      <SelectValue placeholder="All statuses" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="ALL">All statuses</SelectItem>
      {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
    </SelectContent>
  </Select>
</div>
```

### 12.3 Sync all filters to URL with `useUrlState`

```tsx
import { useUrlState } from "@/lib/hooks/use-url-state"

const defaultFilters = { search: "", page: 1, pageSize: 20, status: "" }
const [filters, setFilters] = useUrlState({ defaultValues: defaultFilters })
```

### 12.4 Always reset page to 1 when filters change

```tsx
setFilters({ ...filters, search: newSearch, page: 1 })
setFilters({ ...filters, status: newStatus, page: 1 })
setFilters({ ...filters, pageSize: newSize, page: 1 })
```

---

## 13. State Management

| State type | Tool | Examples |
|------------|------|----------|
| Server data | TanStack Query | API lists, detail records |
| URL filters/pagination | `useUrlState` | search, page, status, sort |
| Dialog open/close | `useState` | `isFormOpen`, `isDeleteOpen` |
| Selected row | `useState` | `selectedUOM: UOM \| null` |
| Global UI | Zustand | Sidebar, auth, theme |
| Form inputs | React Hook Form | All form state |
| Theme | next-themes | Light/dark mode |

### 13.1 Client state — Zustand stores

```tsx
// stores/sidebar.ts
import { create } from "zustand"

interface SidebarStore {
  isOpen: boolean
  toggle: () => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
```

---

## 14. Hooks & Data Fetching

### 14.1 CRUD hook file structure

```tsx
// hooks/finance/use-uom.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Query key hierarchy
const KEYS = {
  all:     ["finance", "uom"] as const,
  lists:   () => [...KEYS.all, "list"] as const,
  list:    (params: object) => [...KEYS.lists(), JSON.stringify(params)] as const,
  details: () => [...KEYS.all, "detail"] as const,
  detail:  (id: string) => [...KEYS.details(), id] as const,
}

export function useUOMs(params: ListUOMsParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => fetchUOMs(params),
    staleTime: 30_000,
  })
}

export function useCreateUOM() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createUOM,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success("UOM created successfully")
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create UOM"),
  })
}

export function useUpdateUOM() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUOMInput }) => updateUOM(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success("UOM updated successfully")
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update UOM"),
  })
}

export function useDeleteUOM() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteUOM,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success("UOM deleted")
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete UOM"),
  })
}
```

### 14.2 Query key convention

```
["service", "resource", "operation", ...params]

["finance", "uom"]                                      // invalidate all UOM
["finance", "uom", "list"]                              // invalidate all UOM lists
["finance", "uom", "list", '{"page":1,"search":"kg"}'] // specific list
["finance", "uom", "detail", "abc-123"]                 // specific item
["iam", "user", "list", ...]
```

Invalidate by prefix:
```tsx
qc.invalidateQueries({ queryKey: ["finance", "uom"] })  // clears all UOM queries
```

### 14.3 Loading state in components

```tsx
const { data, isLoading, isError, error } = useUOMs(filters)

if (isLoading) return <TableSkeleton rows={5} />
if (isError) return <ErrorMessage message={error.message} />
return <UOMTable items={data.items} />
```

### 14.4 staleTime defaults

- Lists with filters: `staleTime: 30_000` (30s)
- Detail views: `staleTime: 60_000` (1 min)
- Reference / rarely-changing: `staleTime: 300_000` (5 min)

---

## 15. BFF API Routes

### 15.1 Route file structure

```
app/api/v1/finance/uoms/
├── route.ts          → GET (list) + POST (create)
└── [id]/
    └── route.ts      → GET (detail) + PUT (update) + DELETE
```

### 15.2 Standard route handler pattern

```tsx
// app/api/v1/finance/uoms/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getUomClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metadata = createMetadataFromRequest(request)  // forwards auth token
    const client = getUomClient()

    const response = await client.listUOMs({
      search: searchParams.get("search") || "",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 20,
    }, metadata)

    return NextResponse.json({
      base: response.base,
      data: response.data,
      pagination: response.pagination,
    })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json(
      { base: { isSuccess: false, statusCode: "500", message: "Internal error" } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const metadata = createMetadataFromRequest(request)
    const client = getUomClient()
    const response = await client.createUOM(body, metadata)
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (isGrpcError(error)) return handleGrpcError(error)
    return NextResponse.json({ base: { isSuccess: false, statusCode: "500" } }, { status: 500 })
  }
}
```

### 15.3 URL → gRPC parameter mapping

Always support both camelCase query params and normalize before passing to gRPC:

```tsx
const page = Number(searchParams.get("page") || searchParams.get("pageNumber")) || 1
const pageSize = Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 20
```

---

## 16. Response Normalization

### 16.1 Every entity has a typed interface + normalizer

```tsx
// types/finance/uom.ts
export interface UOM {
  uomId: string
  uomCode: string
  uomName: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ListUOMsParams {
  page?: number
  pageSize?: number
  search?: string
}

export function normalizeUOM(raw: Record<string, unknown>): UOM {
  return {
    uomId:     String(raw.uomId     || raw.uom_id     || ""),
    uomCode:   String(raw.uomCode   || raw.uom_code   || ""),
    uomName:   String(raw.uomName   || raw.uom_name   || ""),
    isActive:  Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt || raw.created_at || ""),
    updatedAt: String(raw.updatedAt || raw.updated_at || ""),
  }
}
```

### 16.2 Normalization happens in the service layer

```tsx
// services/finance/uom-api.ts
export async function fetchUOMs(params: ListUOMsParams) {
  const qs = new URLSearchParams({ ...params } as Record<string, string>)
  const res = await fetch(`/api/v1/finance/uoms?${qs}`)
  if (!res.ok) throw new Error("Failed to fetch UOMs")
  const json = await res.json()
  return {
    items: (json.data ?? []).map(normalizeUOM),
    pagination: json.pagination,
  }
}
```

---

## 17. Error Handling

### 17.1 Toast notifications via Sonner

```tsx
import { toast } from "sonner"

toast.success("UOM created successfully")
toast.error("Failed to create UOM. Please try again.")
toast.info("Export started — you will be notified when ready.")
```

Always show toasts in mutation `onError` and `onSuccess` callbacks inside hook files, not in component files.

### 17.2 Loading spinner pattern (inline)

```tsx
{isLoading ? (
  <div className="flex h-[320px] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
) : (
  <DataTable ... />
)}
```

### 17.3 Error display in page

```tsx
{isError && (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
    {error instanceof Error ? error.message : "Failed to load data"}
  </div>
)}
```

---

## 18. Alerts & Banners

### 18.1 "Under Development" banner — mandatory for pages with dummy data

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Construction } from "lucide-react"

<Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
  <Construction className="size-4 text-amber-600 dark:text-amber-400" />
  <AlertTitle className="text-amber-800 dark:text-amber-300">
    Under Development — Sample Data Only
  </AlertTitle>
  <AlertDescription className="text-amber-700 dark:text-amber-400">
    {/* Wrap in <p> — AlertDescription uses display:grid internally, which splits
        bare text nodes and inline elements into separate rows without a wrapper */}
    <p>This page is still under development. All figures and charts displayed are <strong>sample data</strong> and do not reflect actual system data.</p>
    Halaman ini masih dalam tahap pengembangan. Semua angka yang ditampilkan adalah{" "}
    <strong>data dummy</strong> dan tidak mencerminkan data sistem yang sebenarnya.
  </AlertDescription>
</Alert>
```

Remove this banner once the page is connected to real data.

### 18.2 Severity to variant mapping

| Severity | Tailwind classes | Icon | When |
|----------|-----------------|------|------|
| Info | `border-blue-200 bg-blue-50 text-blue-900` | `Info` | Tips, guidance |
| Warning | `border-amber-200 bg-amber-50 text-amber-900` | `Construction` / `AlertTriangle` | Under dev, caution |
| Destructive | shadcn `variant="destructive"` | `AlertCircle` | Failures |
| Success | `border-emerald-200 bg-emerald-50 text-emerald-900` | `CheckCircle2` | Completion |

Always add the `dark:` counterpart for every class (see amber example above).

---

## 19. Navigation & Routing

### 19.1 Dynamic sidebar — driven by DB menu data

The sidebar renders from `useMenuTree()` → `menuTreeToNavGroups()`. To add a new page to the sidebar, create a seed migration that inserts rows into `mst_menu` + `menu_permissions`. Do not hardcode nav items in `navigation.ts` for real pages (it's only for breadcrumbs now).

### 19.2 Link navigation

```tsx
import Link from "next/link"

<Button asChild>
  <Link href={`/finance/product-requests/${r.requestId}`}>View</Link>
</Button>
```

### 19.3 Programmatic navigation

```tsx
const router = useRouter()
router.push(`/finance/product-requests/${r.requestId}`)
router.back()
```

### 19.4 Breadcrumbs are auto-generated

`<DynamicBreadcrumb />` in the layout header auto-generates from the current URL path. Do not pass breadcrumb data to page components. Use `config/navigation.ts` only for breadcrumb label overrides.

---

## 20. Permissions (RBAC)

### 20.1 Use `usePermission` hook

```tsx
import { usePermission } from "@/lib/hooks/use-permission"

const { hasPermission } = usePermission()

{hasPermission("finance.master.uom.create") && (
  <Button onClick={handleCreate}>Add UOM</Button>
)}

{hasPermission("finance.master.uom.delete") && (
  <DropdownMenuItem onClick={() => handleDelete(row)}>Delete</DropdownMenuItem>
)}
```

### 20.2 Permission code format

`service.module.entity.action` — e.g. `finance.master.uom.view`

Actions: `view`, `create`, `update`, `delete`, `export`, `import`

Multi-word entities are concatenated (no underscore): `employeelevel`, `companymap`, `productrequest`.

### 20.3 Super admin bypasses all checks

The backend `permission_interceptor.go` is fully implemented. Super admin users bypass RBAC via `IsSuperAdmin()`. Frontend permission checks are for UI only (hide/show); the backend enforces the real gate.

---

## 21. TypeScript

### 21.1 All props must have interfaces

```tsx
// WRONG
function Card({ title, children }) { ... }

// CORRECT
interface CardProps {
  title: string
  children: React.ReactNode
  variant?: "default" | "outline"
  className?: string
}
function Card({ title, children, variant = "default", className }: CardProps) { ... }
```

### 21.2 No `any` — use specific types or `unknown`

```tsx
// WRONG
const data: any = response.data

// CORRECT
const data = response.data as UOM[]
// Or
function normalizeUOM(raw: Record<string, unknown>): UOM { ... }
```

### 21.3 Use type inference for simple cases

```tsx
const [count, setCount] = useState(0)           // inferred: number
const [name, setName] = useState("")             // inferred: string
const [user, setUser] = useState<User | null>(null)  // explicit: nullable
```

### 21.4 Generic components

```tsx
interface TableProps<T> {
  data: T[]
  keyField: keyof T
  columns: ColumnDef<T>[]
}

function Table<T>({ data, keyField, columns }: TableProps<T>) {
  return <table>...</table>
}
```

### 21.5 Use `const` assertions for query keys

```tsx
const KEYS = {
  all: ["finance", "uom"] as const,           // prevents widening to string[]
  list: (p: object) => ["finance", "uom", "list", p] as const,
}
```

---

## 22. Styling & Dark Mode

### 22.1 Use `cn()` for conditional classes

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "outline" && "border border-input bg-transparent",
  className,  // always spread className last for override support
)}>
```

### 22.2 Use semantic color names — never hardcode light-mode colors

```tsx
// WRONG — breaks dark mode
<p className="text-gray-600">Description</p>
<div className="bg-white border-gray-200">Card</div>

// CORRECT — semantic tokens
<p className="text-muted-foreground">Description</p>
<div className="bg-card border-border">Card</div>
```

| Token | Usage |
|-------|-------|
| `bg-background` | Page background |
| `bg-card` | Card background |
| `bg-muted` | Secondary / input background |
| `bg-primary` | Primary actions |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary / label text |
| `text-primary` | Links, emphasis |
| `text-destructive` | Errors |
| `border-border` | Default borders |
| `border-input` | Input borders |

### 22.3 Chart colors must also work in dark mode

Use `hsl(var(--*))` CSS variables for chart tooltips and SVG elements that are not already color-coded by data:

```tsx
// Tooltip background — dark mode safe
background: "hsl(var(--card))"
border: "1px solid hsl(var(--border))"
color: "hsl(var(--card-foreground))"

// Data-series colors (donut segments, bar fills) — use explicit hex
// These are always the same regardless of theme, since they carry data meaning
fill={entry.color}  // e.g. "#22c55e"
```

### 22.4 Custom dot / badge colors

For legend dots, status dots, and similar custom UI elements, always use inline style (not Tailwind) since color comes from data:

```tsx
<span
  className="size-2 rounded-full"
  style={{ backgroundColor: item.color }}
/>
```

---

## 23. Performance

### 23.1 Image optimization — always use `next/image`

```tsx
import Image from "next/image"

// CORRECT
<Image src="/logo.png" alt="Logo" width={100} height={100} priority />

// WRONG
<img src="/logo.png" alt="Logo" />
```

### 23.2 Lazy-load heavy components

```tsx
import dynamic from "next/dynamic"

const BiDashboardViewer = dynamic(
  () => import("@/components/bi/viewer/dashboard-viewer"),
  { loading: () => <ChartSkeleton />, ssr: false }
)
```

Use `ssr: false` for components that rely on browser APIs (recharts, canvas, etc.).

### 23.3 Memoize expensive computations

```tsx
import { useMemo, useCallback } from "react"

const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

const handleSelect = useCallback((id: string) => {
  setSelectedId(id)
}, [])
```

Do not memoize cheap computations — only when profiling shows a real issue.

---

## 24. Accessibility

### 24.1 All interactive elements must be keyboard accessible

```tsx
// Icon-only button
<Button variant="ghost" size="icon" aria-label="Delete UOM">
  <Trash2 className="h-4 w-4" />
</Button>

// Custom div as button
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick() }}
>
```

### 24.2 Form labels are required

```tsx
<label htmlFor="uomCode">Code <span className="text-destructive">*</span></label>
<input id="uomCode" {...form.register("uomCode")} />
```

Or use shadcn `Form` + `FormLabel`:

```tsx
<FormField name="uomCode" render={({ field }) => (
  <FormItem>
    <FormLabel>Code</FormLabel>
    <FormControl><Input {...field} /></FormControl>
    <FormMessage />
  </FormItem>
)} />
```

### 24.3 Use semantic HTML elements

```
Page title   → <h1>  (inside PageHeader)
Section      → <h2> or CardTitle
List         → <ul>/<ol>/<li>
Table        → <table>/<thead>/<tbody>/<tr>/<th>/<td>
Navigation   → <nav>
Main content → <main>
```

---

## 25. Git Workflow

### 25.1 Branch naming

```
feat/{module}-{short-description}    feat/finance-uom-crud
fix/{module}-{short-description}     fix/dashboard-chart-overflow
refactor/{scope}                     refactor/data-table-columns
docs/{topic}                         docs/update-rules
chore/{task}                         chore/upgrade-dependencies
```

### 25.2 Commit message format

```
type(scope): description

feat(finance): add UOM CRUD with export/import
fix(dashboard): fix pie chart not rendering on desktop
refactor(data-table): extract column helpers to shared util
style(uom): align filters bar for mobile
test(hooks): add use-uom query key tests
chore(deps): upgrade recharts to 2.15.4
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `style`, `chore`, `perf`

### 25.3 Pre-push checks

```bash
npm run build      # 1. Must compile
npm run lint       # 2. Zero ESLint errors
npx tsc --noEmit   # 3. Zero TypeScript errors
npm run test:run   # 4. All tests pass
```

---

## 26. Pre-commit Checklist

Run this before every PR.

### Layout & Responsiveness
- [ ] Tested at 390px, 768px, 1280px viewports
- [ ] No horizontal scroll at any viewport
- [ ] Grid items containing charts have `min-w-0`
- [ ] Charts are wrapped in `h-[Npx] w-full` div (not relying on flex-1 or aspect-video)
- [ ] Stacks vertically on mobile, side-by-side on desktop

### Consistency
- [ ] `PageHeader` is outside the `space-y-*` content wrapper
- [ ] KPI stats use `KpiCard` + `KpiGrid` (not raw Card tiles)
- [ ] Text sizes use `typography.*` constants
- [ ] Under-development pages have amber `Alert` banner
- [ ] Search uses `DebouncedSearchInput`
- [ ] Empty state uses `EmptyState` component
- [ ] Status badges use `StatusBadge` with centralized color map
- [ ] Loading states use shared skeleton components

### Charts
- [ ] `min-w-0` on grid items with charts
- [ ] Charts in `h-[Npx] w-full` wrapper — no `ChartContainer` / `aspect-video`
- [ ] Pie uses fixed pixel radii (no percentage strings)
- [ ] Custom HTML legend replaces `<Legend />` recharts component
- [ ] `strokeWidth={2}` on Area charts
- [ ] Tooltip uses CSS var colors for dark mode

### Code Quality
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run lint` → 0 errors
- [ ] `npm run build` → succeeds
- [ ] No raw UUIDs shown to users (inputs, tables, breadcrumbs, URLs)
- [ ] No `any` types
- [ ] All props have TypeScript interfaces
- [ ] `loading.tsx` exists for every data-fetching page

### Dark Mode
- [ ] Uses semantic CSS tokens (`text-foreground`, `bg-card`, `border-border`)
- [ ] No hardcoded light-mode colors (`text-gray-600` → `text-muted-foreground`)
- [ ] Chart tooltips use `hsl(var(--*))` variables
- [ ] Alert/banner has `dark:` counterpart classes
- [ ] Custom colored elements use `style={{ backgroundColor: color }}` (not Tailwind arbitrary values)

### Forms & Data
- [ ] All forms use React Hook Form + Zod
- [ ] No raw UUID inputs — use lookup pickers / comboboxes
- [ ] Delete actions use `ConfirmDialog`
- [ ] Filters reset `page` to 1 when changed
- [ ] Mutations show toast on success and error
- [ ] All mutations invalidate correct query keys

---

## Resources

| Tool | URL |
|------|-----|
| Next.js 16 docs | https://nextjs.org/docs |
| React 19 docs | https://react.dev |
| shadcn/ui | https://ui.shadcn.com |
| TailwindCSS v4 | https://tailwindcss.com/docs |
| Lucide icons | https://lucide.dev/icons |
| TanStack Query | https://tanstack.com/query/latest |
| Recharts | https://recharts.org/en-US |
| Zustand | https://zustand-demo.pmnd.rs |
| Zod | https://zod.dev |
| React Hook Form | https://react-hook-form.com |
| Sonner (toasts) | https://sonner.emilkowal.ski |
