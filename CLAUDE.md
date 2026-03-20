# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev              # Start development server (port 3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run test             # Run tests with Vitest (watch mode)
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage
npx tsc --noEmit         # TypeScript type check
```

## Architecture Overview

**Stack**: Next.js 16 (App Router) + React 19 + TailwindCSS 4 + shadcn/ui + TanStack Query + Zustand

### Data Flow Pattern (BFF Architecture)
```
Browser → React Components → TanStack Query hooks
    → /api/v1/* (Next.js API routes) → gRPC → Backend microservices
```

- API routes in `src/app/api/v1/` act as BFF (Backend-for-Frontend), calling gRPC services
- gRPC client configuration in `src/lib/grpc/`
- Service clients in `src/services/`

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard route group (all main pages)
│   │   ├── layout.tsx      # Sidebar + header layout
│   │   └── finance/uom/    # Example: UOM management page
│   └── api/v1/             # API routes (BFF layer)
├── components/
│   ├── ui/                 # shadcn/ui primitives - DO NOT MODIFY
│   ├── common/             # Shared components (PageHeader, etc.)
│   ├── shared/             # Reusable feature components (DataTable, etc.)
│   ├── finance/            # Finance module components
│   ├── iam/                # IAM module components (users, roles, permissions, menus, etc.)
│   ├── settings/           # Settings/Administrator components (roles, permissions)
│   └── loading/            # Skeleton components
├── hooks/                  # Custom hooks (use-*.ts)
│   ├── finance/use-uom.ts # UOM CRUD hooks
│   └── iam/               # IAM hooks (use-menu, use-permissions, use-roles, etc.)
├── services/               # API service functions
├── types/                  # TypeScript types + normalizers
├── providers/              # React context providers
└── config/                 # Navigation, site config
```

### State Management
- **Server state**: TanStack Query for data fetching/caching (with 30s staleTime)
- **Client state**: Zustand for UI state (sidebar, modals)
- **Form state**: React Hook Form + Zod validation
- **URL state**: Custom `useUrlState` hook (`src/lib/hooks/use-url-state.ts`) for search/filter/pagination

### Provider Stack
```
QueryProvider → ThemeProvider → AuthProvider → PermissionProvider → {children}
```
- **AuthProvider**: user state, login/logout, auto token refresh (every 10min)
- **PermissionProvider**: RBAC permission checking (`hasPermission()`)

### URL State + Debounced Search Pattern
For search inputs that sync to URL state, use `DebouncedSearchInput`:
```tsx
import { DebouncedSearchInput } from "@/components/common"

<DebouncedSearchInput
  value={filters.search || ""}
  onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
  placeholder="Search..."
  debounceMs={300}
/>
```
This provides immediate UI feedback while debouncing URL updates to prevent performance issues.

### Component Patterns

**Feature file structure** (e.g., UOM):
```
types/finance/uom.ts          # Types + normalizer functions
services/finance/uom-api.ts   # API calls
hooks/finance/use-uom.ts      # TanStack Query hooks
components/finance/uom/       # UI components
app/api/v1/finance/uoms/      # API routes
```

**Backend response normalization** (handles both camelCase and snake_case):
```typescript
function normalizeUOM(uom: RawUOM): NormalizedUOM {
  return {
    uomId: uom.uomId || uom.uom_id || "",
    // ... other fields
  }
}
```

### Dynamic Sidebar System

The sidebar is driven by database menu data (not hardcoded):
- `useMenuTree()` hook fetches menu tree from `/api/v1/iam/menus/tree`
- `menuTreeToNavGroups()` converts API response to sidebar navigation format
- Icons are lazy-loaded via `preloadMenuIcons()` + `resolveIcon()` in `types/iam/menu.ts`
- Key files: `hooks/iam/use-menu.ts`, `types/iam/menu.ts`, `components/app-sidebar.tsx`

**Menu permissions**: Menus with NO entries in `menu_permissions` table → visible to ALL users. Menus WITH entries → require user to have at least one matching permission.

## Critical Rules

1. **Never modify `components/ui/`** - shadcn/ui managed files. Create wrappers in `components/common/` instead
2. **Always add `loading.tsx`** - Every page with data fetching needs a loading skeleton
3. **Use `@/` import alias** - Never use relative imports like `../../../`
4. **`"use client"` only when needed** - Only for components using hooks/interactivity
5. **Strict TypeScript** - Define interfaces for all props, avoid `any`

## Testing

Tests use Vitest + Testing Library. Test files: `src/**/*.{test,spec}.{ts,tsx}`

```bash
npm run test                           # Watch mode
npm run test:run                       # Single run
npm run test -- src/path/to/file.test.ts  # Run specific test
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

## Environment Variables

```bash
# gRPC endpoints (server-side only, NOT browser-exposed)
FINANCE_GRPC_HOST=localhost       # Finance service gRPC host
FINANCE_GRPC_PORT=50051           # Finance service gRPC port
IAM_GRPC_HOST=localhost           # IAM service gRPC host
IAM_GRPC_PORT=50052               # IAM service gRPC port

# Public variables (exposed to browser)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Libraries

- **Forms**: react-hook-form + @hookform/resolvers + zod
- **Data fetching**: @tanstack/react-query
- **State**: zustand
- **URL state**: Custom `useUrlState` hook (see `src/lib/hooks/use-url-state.ts`)
- **Debouncing**: Custom hooks (see `src/lib/hooks/use-debounce.ts`)
- **Notifications**: sonner
- **Icons**: lucide-react
- **Charts**: recharts

## Reusable Components for Filters

- `DebouncedSearchInput` - Search input with debounce (prevents keystroke issues)
- Located in `src/components/common/debounced-search-input.tsx`
