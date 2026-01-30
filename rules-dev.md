# Frontend Development Rules & Guidelines

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Applies to:** All Frontend Developers

---

## 1. Project Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard route group
│   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   └── [module]/       # Module pages
│   ├── (auth)/             # Auth route group
│   └── api/                # API routes (BFF)
├── components/
│   ├── app-sidebar.tsx     # Main sidebar component
│   ├── charts/             # Chart components (AreaChart, BarChart, PieChart)
│   ├── common/             # Shared components (PageHeader, DynamicBreadcrumb)
│   ├── loading/            # Skeleton loaders
│   ├── nav/                # Navigation components (NavMain, NavUser, SiteHeader)
│   └── ui/                 # shadcn/ui primitives (DO NOT MODIFY)
├── config/                 # App configuration
│   ├── navigation.ts       # Sidebar navigation structure
│   └── site.ts             # Site metadata
├── data/                   # Mock JSON data (mimics API responses)
├── lib/                    # Utilities
│   └── grpc/               # gRPC client utilities
├── providers/              # React context providers
└── services/               # Service clients (gRPC services)
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `page-header.tsx` |
| Pages | `page.tsx` | `app/(dashboard)/dashboard/page.tsx` |
| Loading | `loading.tsx` | `app/(dashboard)/dashboard/loading.tsx` |
| Layouts | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Config | `kebab-case.ts` | `navigation.ts` |
| Types | `types.ts` or inline | `types.ts` |

---

## 2. Component Guidelines

### Component Structure

```tsx
"use client" // Only if using hooks/interactivity

import { type FC } from "react"
// External imports first
import { someUtility } from "some-package"

// Internal imports (use aliases)
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Types (export if reusable)
export interface MyComponentProps {
  title: string
  variant?: "default" | "outline"
  children?: React.ReactNode
}

// Component (prefer function declaration for pages, arrow for small components)
export function MyComponent({ title, variant = "default", children }: MyComponentProps) {
  return (
    <div className={cn("base-classes", variant === "outline" && "outline-classes")}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### shadcn/ui Components

> ⚠️ **DO NOT MODIFY** files in `components/ui/`. They are managed by shadcn CLI.

- Always use shadcn components as primitives
- Wrap and extend in `components/common/` if needed
- To add new components: `npx shadcn@latest add [component]`

### Creating New Components

1. **Location**: Place in appropriate directory:
   - `components/common/` - Reusable across app
   - `components/[feature]/` - Feature-specific
   - `components/charts/` - Chart wrappers

2. **Barrel Exports**: Always export from `index.ts`:
   ```ts
   // components/common/index.ts
   export { PageHeader } from "./page-header"
   export { DynamicBreadcrumb } from "./dynamic-breadcrumb"
   ```

3. **Props Interface**: Always define and export props interface

---

## 3. Page Development

### Page Template

```tsx
import { PageHeader } from "@/components/common/page-header"

export default function MyPage() {
  return (
    <div>
      <PageHeader
        title="Page Title"
        subtitle="Optional description"
      >
        {/* Optional action buttons */}
      </PageHeader>

      {/* Page content */}
    </div>
  )
}
```

### Loading States

**REQUIRED**: Every page with data fetching must have a `loading.tsx`:

```tsx
// app/(dashboard)/[module]/loading.tsx
import { TableSkeleton } from "@/components/loading"

export default function Loading() {
  return <TableSkeleton rows={5} />
}
```

Available skeletons:
- `PageSkeleton` - Full page with header, cards, charts
- `CardSkeleton` - Single stat card
- `ChartSkeleton` - Chart card
- `TableSkeleton` - Data table
- `DashboardSkeleton` - Complete dashboard

### Breadcrumbs

Breadcrumbs are **automatically generated** from the URL path in the layout header. No need to pass them to components.

---

## 4. Navigation

### Adding New Menu Items

Edit `src/config/navigation.ts`:

```ts
// Supports up to 3 levels
{
  title: "Module Name",
  url: "/module/dashboard",
  icon: IconComponent, // from lucide-react
  items: [
    {
      title: "Sub Page",
      url: "/module/subpage",
      items: [
        { title: "Level 3", url: "/module/subpage/detail" }
      ]
    }
  ]
}
```

### Navigation Groups

Use `NavGroup` to organize into sections:
- Overview (Dashboard)
- Modules (Finance, IT, HR, etc.)
- Settings

---

## 5. Data Management

### API Routes (BFF Pattern)

```
app/api/v1/[service]/[resource]/route.ts
```

Example:
```ts
// app/api/v1/costing/uoms/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  // TODO: Replace with gRPC call
  const data = await fetchFromBackend()
  return NextResponse.json(data)
}
```

### Mock Data

Store mock data in `src/data/`:
```json
// src/data/costing.json
{
  "uoms": [...],
  "parameters": [...]
}
```

Use in components:
```tsx
import data from "@/data/costing.json"
```

### TanStack Query (Future)

```tsx
"use client"
import { useQuery } from "@tanstack/react-query"

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["uoms"],
    queryFn: () => fetch("/api/v1/costing/uoms").then(r => r.json())
  })

  if (isLoading) return <TableSkeleton />
  return <DataTable data={data} />
}
```

---

## 6. Styling

### Tailwind CSS

- Use utility classes directly
- Use `cn()` helper for conditional classes
- Follow existing patterns in codebase

### CSS Variables (Dark Mode)

Theme colors are defined in `app/globals.css`. Use semantic names:
- `bg-background` - Main background
- `bg-muted` - Secondary background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text

### Responsive Design

- Mobile-first approach
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test on common breakpoints: 375px, 768px, 1024px, 1440px

---

## 7. TypeScript

### Strict Mode

TypeScript strict mode is enabled. Always:
- Define types for props
- Avoid `any` type
- Use proper generics

### Import Aliases

Use `@/` prefix for all internal imports:
```ts
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

---

## 8. Git Workflow

### Branch Naming

```
feature/module-feature-name
fix/issue-description
refactor/component-name
```

### Commit Messages

```
feat(finance): add UOM management page
fix(sidebar): correct collapsible state
refactor(nav): simplify navigation structure
```

### Pre-commit Checks

Before committing:
1. `npm run build` - Ensure no TypeScript errors
2. `npm run lint` - Check for linting issues

---

## 9. Code Review Checklist

- [ ] Component follows project structure
- [ ] Props interface is exported
- [ ] Loading state implemented
- [ ] No hardcoded strings (use config)
- [ ] Responsive design tested
- [ ] Dark mode compatible
- [ ] Proper error handling
- [ ] TypeScript errors resolved

---

## 10. Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
- [TanStack Query](https://tanstack.com/query/latest)
