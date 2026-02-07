# GoApps Frontend Development Guide

## Overview

GoApps Frontend is built with Next.js 16, TanStack Query, shadcn/ui, and Tailwind CSS v4. It communicates with the Go backend via REST API (using Next.js API routes as a proxy).

## Architecture

### Frontend-Backend Communication

```
Browser → Next.js API Routes → gRPC-Gateway (HTTP) → Go Backend (gRPC)
```

- **Proto-generated types**: TypeScript types are generated from `.proto` files using `ts-proto`
- **JSON responses**: Backend returns camelCase JSON (configured in gRPC-gateway)
- **Type parsing**: Use `*.fromJSON()` methods from proto-generated types for consistent parsing

### Key Directories

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── shared/            # Reusable components (DataTable, ConfirmDialog, etc.)
│   ├── finance/           # Finance module components
│   └── ui/                # shadcn/ui components
├── hooks/                  # TanStack Query hooks
├── lib/
│   ├── api/               # API client with retry/timeout
│   └── hooks/             # CRUD hook factory
├── services/              # API service functions
└── types/
    ├── generated/         # Proto-generated TypeScript types
    └── finance/           # Feature-specific types with UI helpers
```

## Proto-Generated Types

Types are generated from `.proto` files and include:

- **Interfaces**: `UOM`, `CreateUOMRequest`, `ListUOMsResponse`, etc.
- **Enums**: `UOMCategory`, `ActiveFilter` (numeric values: 0, 1, 2, ...)
- **MessageFns**: `fromJSON()`, `toJSON()`, `fromPartial()` methods

### Using Proto Types

```typescript
import {
  type UOM,
  type ListUOMsResponse,
  ListUOMsResponseParser,
  UOMCategory,
} from "@/types/finance/uom"

// Parse raw JSON response
const response = ListUOMsResponseParser.fromJSON(rawData)
// response.base.isSuccess is properly parsed as boolean
// response.data is properly typed as UOM[]
```

### Enum Values

Proto enums use numeric values:

```typescript
// Proto enum (numeric)
enum UOMCategory {
  UOM_CATEGORY_UNSPECIFIED = 0,
  UOM_CATEGORY_WEIGHT = 1,
  UOM_CATEGORY_LENGTH = 2,
  UOM_CATEGORY_VOLUME = 3,
  UOM_CATEGORY_QUANTITY = 4,
}

// Use in API calls
const params = { category: UOMCategory.UOM_CATEGORY_WEIGHT }
```

## Shared Components

### DataTable

```tsx
import { DataTable, type ColumnDef } from "@/components/shared"

const columns: ColumnDef<UOM>[] = [
  { id: "code", header: "Code", accessorKey: "uomCode" },
  { id: "name", header: "Name", cell: (row) => row.uomName },
]

<DataTable
  data={items}
  columns={columns}
  keyField="uomId"
  actions={[{ id: "edit", label: "Edit", onClick: handleEdit }]}
  isLoading={isLoading}
/>
```

### ConfirmDialog

```tsx
import { ConfirmDialog } from "@/components/shared"

<ConfirmDialog
  open={showDelete}
  onOpenChange={setShowDelete}
  title="Delete Item"
  description="Are you sure?"
  variant="destructive"
  isLoading={isPending}
  onConfirm={handleDelete}
/>
```

### DataTablePagination

```tsx
import { DataTablePagination } from "@/components/shared"

<DataTablePagination
  currentPage={page}
  pageSize={pageSize}
  totalItems={total}
  totalPages={totalPages}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

## CRUD Hook Factory

Create hooks for CRUD operations:

```typescript
import { createCrudHooks } from "@/lib/hooks"
import { ListUOMsResponseParser, ... } from "@/types/finance/uom"

const {
  useList: useUOMs,
  useCreate: useCreateUOM,
  useUpdate: useUpdateUOM,
  useDelete: useDeleteUOM,
  queryKeys: uomKeys,
} = createCrudHooks<UOM, ListParams, CreateReq, UpdateReq, ...>({
  resourceName: "UOM",
  apiBasePath: "/api/v1/finance/uoms",
  parsers: {
    listResponse: (data) => ListUOMsResponseParser.fromJSON(data),
    createResponse: (data) => CreateUOMResponseParser.fromJSON(data),
    // ...
  },
  getEntityId: (uom) => uom.uomId,
})
```

## API Client

The API client provides retry, timeout, and error handling:

```typescript
import { apiClient, ApiError } from "@/lib/api"

// GET request
const response = await apiClient.get<ListUOMsResponse>("/api/v1/finance/uoms")

// POST request
const result = await apiClient.post<CreateUOMResponse>("/api/v1/finance/uoms", data)

// Handle errors
try {
  await apiClient.delete(`/api/v1/finance/uoms/${id}`)
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.validationErrors)
  }
}
```

## Response Structure

All API responses follow this structure:

```typescript
interface Response {
  base: {
    isSuccess: boolean
    message: string
    statusCode: string
    validationErrors: { field: string; message: string }[]
  }
  data?: T  // for single entity
  data: T[] // for list
  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}
```

## Testing

```bash
# Run tests
pnpm test

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## URL State Management

Filter, search, sort, dan pagination harus disimpan di URL agar state tidak hilang saat reload halaman.

### useUrlState Hook

```typescript
import { useUrlState } from "@/lib/hooks"

const [filters, setFilters] = useUrlState({
  defaultValues: {
    page: 1,
    pageSize: 10,
    search: "",
    category: UOMCategory.UOM_CATEGORY_UNSPECIFIED,
    sortBy: "code",
    sortOrder: "asc",
  },
})

// Update state - akan otomatis update URL
setFilters({ ...filters, search: "KG", page: 1 })
```

### DebouncedSearchInput (PENTING!)

**JANGAN** gunakan `<Input>` langsung untuk search yang terhubung ke URL state. Ini akan menyebabkan:
- Keystroke dropping (mengetik "tesad" hanya terinput "ead")
- Performance lambat karena setiap keystroke = URL update = network request

**GUNAKAN** `DebouncedSearchInput`:

```tsx
import { DebouncedSearchInput } from "@/components/common"

// ✅ BENAR - Gunakan DebouncedSearchInput
<DebouncedSearchInput
  value={filters.search || ""}
  onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
  placeholder="Search..."
  debounceMs={300}
/>

// ❌ SALAH - Jangan gunakan Input langsung
<Input
  value={filters.search}
  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
/>
```

### Cara Kerja DebouncedSearchInput

1. **Local state** - Input langsung update local state (UI responsif)
2. **Debounce** - Setelah user berhenti mengetik 300ms, baru sync ke URL
3. **External sync** - Handle browser back/forward dengan remount inner component

### Kapan Perlu Debounce?

| Input Type | Perlu Debounce? | Alasan |
|------------|-----------------|--------|
| Search text | ✅ Ya | User mengetik cepat, mencegah spam request |
| Select/Dropdown | ❌ Tidak | Single click, tidak rapid input |
| Sort | ❌ Tidak | Single click |
| Pagination | ❌ Tidak | Single click |

## Navigation & Sidebar

### 3-Level Menu Structure

The sidebar supports 3-level nested navigation:

```
Level 1: Module      (e.g., Finance)        → has icon, URL to module dashboard
Level 2: Category    (e.g., Master)         → has icon, NO URL (grouping only)
Level 3: Page/Leaf   (e.g., Unit of Measure) → has URL (actual page)
```

### Navigation Config (`src/config/navigation.ts`)

All menu items are defined in `navigation` as `NavGroup[]`. Each item has:

```typescript
interface MenuItem {
  id: string             // Unique identifier
  title: string          // Display title
  url?: string           // Route path (undefined for categories)
  icon?: LucideIcon      // Icon (level 1 & 2)
  permission?: string    // Permission code for IAM
  order: number          // Sort order
  isVisible: boolean     // Visibility flag
  children?: MenuItem[]  // Nested children
}
```

### Adding a New Menu Item

1. Add the item in `src/config/navigation.ts` under the appropriate parent
2. Add breadcrumb entry in `breadcrumbConfig` (same file)
3. Create the page under `src/app/(dashboard)/...`

### Sidebar Filtering

The sidebar uses `getVisibleNavigation(permissions)` which:
- Filters by `isVisible` flag
- Filters by user's permission codes (from `PermissionProvider`)
- Removes empty categories (categories with no visible children)

```typescript
// In app-sidebar.tsx
const { permissions } = usePermission()
const visibleNavigation = getVisibleNavigation(permissions)
```

---

## Breadcrumbs

### How Breadcrumbs Work

The `DynamicBreadcrumb` component (in `src/components/common/dynamic-breadcrumb.tsx`) generates breadcrumbs automatically:

1. **Primary**: Uses `buildBreadcrumbTrail(pathname)` — traverses the navigation tree to find the matching path and builds the full trail
2. **Fallback**: Uses `breadcrumbConfig` mapping for paths not in the nav tree

### Breadcrumb Rules

| Path | Breadcrumb |
|------|-----------|
| `/dashboard` | **Home** (no link, single item) |
| `/finance/dashboard` | Home > **Finance** |
| `/finance/master/uom` | Home > Finance > Master > **Unit of Measure** |
| `/finance/transaction/costing-process` | Home > Finance > Transaction > **Costing Process** |

- **Last item**: Rendered as `<BreadcrumbPage>` (bold, no link)
- **Category items** (no URL): Rendered as plain `<span>` with muted text (NOT a link)
- **Linkable items**: Rendered as `<Link>` with href
- **Collapse**: When >4 items, middle items collapse into a dropdown

### Adding Breadcrumbs for New Pages

If the page is in the navigation tree, breadcrumbs are **automatic** via `buildBreadcrumbTrail()`. For pages not in the nav tree, add to `breadcrumbConfig`:

```typescript
// In src/config/navigation.ts
export const breadcrumbConfig = {
  "/finance/master/currency": { title: "Currency" },
  // Category with no page:
  "/finance/reports": { title: "Reports", href: undefined },
}
```

---

## Permission System

### Current State (Hardcoded)

Permissions are hardcoded in `src/providers/permission-provider.tsx`. When IAM service is ready, only this file needs to change.

### Using Permissions in Components

```typescript
import { usePermission } from "@/lib/hooks"

function MyComponent() {
  const { hasPermission, hasAnyPermission } = usePermission()

  return (
    <div>
      {hasPermission("finance.master.uom.create") && (
        <Button>Add UOM</Button>
      )}
    </div>
  )
}
```

### Permission Code Convention

```
{module}.{category?}.{resource?}.{action}
```

Examples: `finance.view`, `finance.master.uom.view`, `finance.master.uom.create`

Actions: `view`, `create`, `update`, `delete`, `export`, `import`

### IAM Integration

See [IAM Menu & Permission Spec](./IAM_MENU_PERMISSION_SPEC.md) for backend implementation details.

---

## Page Metadata (Dynamic Titles)

Every page should export metadata for browser tab titles.

### For Server Components (most pages)

```typescript
// page.tsx
import { generateMetadata as genMeta } from "@/config/site"

export const metadata = genMeta("Unit of Measure")
// Browser tab: "Unit of Measure | Go Apps"
```

### For Client Component Pages

Split into server wrapper + client component:

```
app/(dashboard)/finance/master/uom/
├── page.tsx              # Server component: exports metadata + renders client
└── uom-page-client.tsx   # "use client" — actual page content
```

```typescript
// page.tsx (server)
import { generateMetadata as genMeta } from "@/config/site"
import UomPageClient from "./uom-page-client"

export const metadata = genMeta("Unit of Measure")

export default function UOMPage() {
  return <UomPageClient />
}
```

### For Home Dashboard

```typescript
export const metadata = genMeta("Dashboard", true)
// Browser tab: "Go Apps - Enterprise Dashboard"
```

---

## Loading Skeletons

**Every page must have a `loading.tsx`** next to its `page.tsx`. Available skeletons:

```typescript
import { DashboardSkeleton } from "@/components/loading"  // For dashboard pages
import { TableSkeleton } from "@/components/loading"       // For list/table pages
import { PageSkeleton } from "@/components/loading"        // Generic
```

Example:
```typescript
// loading.tsx
import { DashboardSkeleton } from "@/components/loading"

export default function Loading() {
    return <DashboardSkeleton />
}
```

---

## Related Documentation

- [CRUD Feature Guide](./STEP_BY_STEP_GUIDE.md) - Step-by-step guide to create new CRUD features
- [IAM Menu & Permission Spec](./IAM_MENU_PERMISSION_SPEC.md) - Backend spec for dynamic menus & roles
- [Proto Generation](./PROTO_GENERATION.md) - How to generate TypeScript types from proto files
- [Component Library](./COMPONENT_LIBRARY.md) - Shared component documentation
