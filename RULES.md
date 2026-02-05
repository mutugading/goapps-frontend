# Frontend Development Rules

Guidelines and conventions for all frontend developers working with `goapps-frontend`.

> **Version:** 1.1.0  
> **Last Updated:** February 2026  
> **Applies to:** All Frontend Developers

---

## 📋 Table of Contents

1. [Golden Rules](#golden-rules)
2. [Project Structure](#project-structure)
3. [Component Guidelines](#component-guidelines)
4. [Page Development](#page-development)
5. [Navigation](#navigation)
6. [Data Management](#data-management)
7. [State Management](#state-management)
8. [Styling](#styling)
9. [TypeScript](#typescript)
10. [Form Handling](#form-handling)
11. [Error Handling](#error-handling)
12. [Performance](#performance)
13. [Accessibility](#accessibility)
14. [Git Workflow](#git-workflow)
15. [Code Review Checklist](#code-review-checklist)

---

## Golden Rules

> ⚠️ **Rules that MUST NOT be violated!**

### 1. Never Modify shadcn/ui Files

```tsx
// ❌ WRONG - Never edit files in components/ui/
// src/components/ui/button.tsx - DO NOT MODIFY

// ✅ CORRECT - Create wrapper in components/common/
// src/components/common/submit-button.tsx
import { Button } from "@/components/ui/button"

export function SubmitButton({ children, ...props }) {
  return <Button type="submit" {...props}>{children}</Button>
}
```

### 2. Always Add Loading States

```tsx
// ❌ WRONG - Page without loading state
// src/app/(dashboard)/finance/uom/page.tsx (no loading.tsx)

// ✅ CORRECT - Always create loading.tsx
// src/app/(dashboard)/finance/uom/loading.tsx
import { TableSkeleton } from "@/components/loading"

export default function Loading() {
  return <TableSkeleton rows={5} />
}
```

### 3. Use Client Directive Only When Needed

```tsx
// ❌ WRONG - Unnecessary "use client"
"use client"
export function StaticCard({ title }) {
  return <div>{title}</div>
}

// ✅ CORRECT - Only for components with hooks/interactivity
"use client"
import { useState } from "react"

export function InteractiveCard({ title }) {
  const [isOpen, setIsOpen] = useState(false)
  return <div onClick={() => setIsOpen(!isOpen)}>{title}</div>
}
```

### 4. Use Import Aliases

```tsx
// ❌ WRONG - Relative imports
import { Button } from "../../../components/ui/button"

// ✅ CORRECT - Use @ alias
import { Button } from "@/components/ui/button"
```

### 5. Never Skip TypeScript Types

```tsx
// ❌ WRONG - Missing types
function UserCard({ user }) {
  return <div>{user.name}</div>
}

// ✅ CORRECT - Proper types
interface User {
  id: string
  name: string
  email: string
}

interface UserCardProps {
  user: User
}

function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>
}
```

---

## Project Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard route group
│   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   └── [module]/       # Module pages
│   ├── (auth)/             # Auth route group (future)
│   └── api/                # API routes (BFF)
├── components/
│   ├── app-sidebar.tsx     # Main sidebar component
│   ├── charts/             # Chart components
│   ├── common/             # Shared components
│   ├── loading/            # Skeleton loaders
│   ├── nav/                # Navigation components
│   └── ui/                 # shadcn/ui primitives (DO NOT MODIFY)
├── config/                 # App configuration
│   ├── navigation.ts       # Sidebar navigation structure
│   └── site.ts             # Site metadata
├── data/                   # Mock JSON data
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
│   └── grpc/               # gRPC client
├── providers/              # React context providers
└── services/               # Service clients
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `page-header.tsx` |
| Pages | `page.tsx` | `app/(dashboard)/dashboard/page.tsx` |
| Loading | `loading.tsx` | `app/(dashboard)/dashboard/loading.tsx` |
| Error | `error.tsx` | `app/(dashboard)/dashboard/error.tsx` |
| Layouts | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Config | `kebab-case.ts` | `navigation.ts` |
| Hooks | `use-*.ts` | `use-sidebar.ts` |
| Types | `types.ts` | `types.ts` |
| Utilities | `kebab-case.ts` | `format-date.ts` |

---

## Component Guidelines

### Component Structure

```tsx
"use client" // Only if using hooks/interactivity

// 1. External imports first
import { type FC } from "react"
import { SomeIcon } from "lucide-react"

// 2. Internal imports (use aliases)
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 3. Types (export if reusable)
export interface MyComponentProps {
  title: string
  variant?: "default" | "outline"
  children?: React.ReactNode
}

// 4. Component
export function MyComponent({ 
  title, 
  variant = "default", 
  children 
}: MyComponentProps) {
  return (
    <div className={cn(
      "base-classes", 
      variant === "outline" && "outline-classes"
    )}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### Component Locations

| Type | Location | Example |
|------|----------|---------|
| UI Primitives | `components/ui/` | shadcn/ui (managed) |
| Shared Components | `components/common/` | `PageHeader`, `DynamicBreadcrumb` |
| Feature Components | `components/[feature]/` | `components/finance/` |
| Chart Wrappers | `components/charts/` | `AreaChart`, `BarChart` |
| Navigation | `components/nav/` | `NavMain`, `NavUser` |
| Skeletons | `components/loading/` | `TableSkeleton` |

### Barrel Exports

Always create index files for folders:

```tsx
// components/common/index.ts
export { PageHeader } from "./page-header"
export { DynamicBreadcrumb } from "./dynamic-breadcrumb"

// Usage
import { PageHeader, DynamicBreadcrumb } from "@/components/common"
```

---

## Page Development

### Page Template

```tsx
import { PageHeader } from "@/components/common"

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

| Skeleton | Usage |
|----------|-------|
| `PageSkeleton` | Full page with header, cards, charts |
| `CardSkeleton` | Single stat card |
| `ChartSkeleton` | Chart card |
| `TableSkeleton` | Data table |
| `DashboardSkeleton` | Complete dashboard |

### Error Boundaries

```tsx
// app/(dashboard)/[module]/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

## Navigation

### Adding New Menu Items

Edit `src/config/navigation.ts`:

```tsx
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

Organize into sections:

```tsx
export const navGroups = {
  overview: [
    { title: "Dashboard", url: "/dashboard", icon: Home }
  ],
  modules: [
    { title: "Finance", url: "/finance", icon: DollarSign, items: [...] },
    { title: "HR", url: "/hr", icon: Users, items: [...] },
  ],
  settings: [
    { title: "Settings", url: "/settings", icon: Settings }
  ]
}
```

---

## Data Management

### API Routes (BFF Pattern)

```
app/api/v1/[service]/[resource]/route.ts
```

Example:

```tsx
// app/api/v1/costing/uoms/route.ts
import { NextResponse } from "next/server"
import { getCostingService } from "@/services/costing"

export async function GET() {
  try {
    const service = await getCostingService()
    const data = await service.listUOMs({})
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const service = await getCostingService()
    const result = await service.createUOM(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 500 }
    )
  }
}
```

### Mock Data

Store mock data in `src/data/`:

```json
// src/data/costing.json
{
  "uoms": [
    { "id": "1", "code": "KG", "name": "Kilogram" },
    { "id": "2", "code": "M", "name": "Meter" }
  ]
}
```

Use in components:

```tsx
import data from "@/data/costing.json"

function UOMList() {
  return (
    <ul>
      {data.uoms.map(uom => (
        <li key={uom.id}>{uom.name}</li>
      ))}
    </ul>
  )
}
```

---

## State Management

### Server State (TanStack Query)

For data fetching and caching:

```tsx
"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Fetch data
function useUOMs() {
  return useQuery({
    queryKey: ["uoms"],
    queryFn: () => fetch("/api/v1/costing/uoms").then(r => r.json())
  })
}

// Mutate data
function useCreateUOM() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateUOMInput) =>
      fetch("/api/v1/costing/uoms", {
        method: "POST",
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms"] })
    }
  })
}
```

### Client State (Zustand)

For UI state:

```tsx
// stores/sidebar.ts
import { create } from "zustand"

interface SidebarStore {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}))
```

### When to Use What

| State Type | Tool | Examples |
|------------|------|----------|
| Server data | TanStack Query | API responses, lists |
| UI state | Zustand | Sidebar, modals, preferences |
| Form state | React Hook Form | Form inputs, validation |
| URL state | Next.js | Search params, filters |
| Theme | next-themes | Light/dark mode |

---

## Styling

### TailwindCSS Best Practices

```tsx
// ✅ Good - Use cn() for conditional classes
import { cn } from "@/lib/utils"

<div className={cn(
  "base-styles",
  isActive && "active-styles",
  variant === "outline" && "border border-input"
)}>

// ❌ Bad - String concatenation
<div className={"base " + (isActive ? "active" : "")}>
```

### Semantic Colors

Use semantic color names:

| Class | Usage |
|-------|-------|
| `bg-background` | Main background |
| `bg-muted` | Secondary background |
| `bg-card` | Card background |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary text |
| `border-border` | Default borders |
| `bg-primary` | Primary actions |
| `text-primary-foreground` | Text on primary |

### Responsive Design

Mobile-first approach:

```tsx
// ✅ Good - Mobile first
<div className="w-full md:w-1/2 lg:w-1/3">

// Test breakpoints:
// - 375px (mobile)
// - 768px (tablet)
// - 1024px (desktop)
// - 1440px (large desktop)
```

---

## TypeScript

### Strict Mode

TypeScript strict mode is enabled. Always:

- Define types for props
- Avoid `any` type
- Use proper generics

### Common Patterns

```tsx
// Props with children
interface CardProps {
  title: string
  children: React.ReactNode
}

// Optional props with defaults
interface ButtonProps {
  variant?: "default" | "outline" | "ghost"
}

function Button({ variant = "default" }: ButtonProps) {
  // ...
}

// Generic components
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>
}
```

### Type Inference

```tsx
// Let TypeScript infer when obvious
const [count, setCount] = useState(0) // inferred as number
const users = [] as User[]

// Be explicit for complex types
const [data, setData] = useState<User | null>(null)
```

---

## Form Handling

### React Hook Form + Zod

```tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// 1. Define schema
const formSchema = z.object({
  code: z.string().min(1, "Code is required").max(10),
  name: z.string().min(1, "Name is required").max(100),
})

type FormData = z.infer<typeof formSchema>

// 2. Use in component
function UOMForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
    },
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("code")} />
      {form.formState.errors.code && (
        <span>{form.formState.errors.code.message}</span>
      )}
      
      <input {...form.register("name")} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## Error Handling

### API Errors

```tsx
// In TanStack Query
const { data, error, isError } = useQuery({
  queryKey: ["uoms"],
  queryFn: async () => {
    const res = await fetch("/api/v1/costing/uoms")
    if (!res.ok) {
      throw new Error("Failed to fetch UOMs")
    }
    return res.json()
  }
})

if (isError) {
  return <ErrorMessage message={error.message} />
}
```

### Error Boundaries

```tsx
"use client"

import { ErrorBoundary } from "react-error-boundary"

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

---

## Performance

### Image Optimization

```tsx
import Image from "next/image"

// ✅ Good - Use Next.js Image
<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority // For above-the-fold images
/>

// ❌ Bad - Regular img tag
<img src="/logo.png" alt="Logo" />
```

### Code Splitting

```tsx
import dynamic from "next/dynamic"

// Lazy load heavy components
const Chart = dynamic(() => import("@/components/charts/area-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from "react"

// Memoize expensive components
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
})

// Memoize expensive calculations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

---

## Accessibility

### ARIA Labels

```tsx
// ✅ Good - Accessible button
<button
  aria-label="Close dialog"
  onClick={onClose}
>
  <X className="h-4 w-4" />
</button>

// ✅ Good - Form labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Keyboard Navigation

```tsx
// ✅ Good - Handle keyboard events
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick()
    }
  }}
>
  Click me
</div>
```

---

## Git Workflow

### Branch Naming

```
feature/module-feature-name
fix/issue-description
refactor/component-name
docs/update-readme
```

### Commit Messages

```bash
# Format: type(scope): description
feat(finance): add UOM management page
fix(sidebar): correct collapsible state
refactor(nav): simplify navigation structure
docs(readme): update quick start guide
style(button): adjust padding and colors
```

### Pre-commit Checks

Before committing:

```bash
# 1. Build check
npm run build

# 2. Lint check
npm run lint

# 3. Type check
npx tsc --noEmit
```

---

## Code Review Checklist

### Component Review

- [ ] Component follows project structure
- [ ] Props interface is exported
- [ ] Loading state implemented
- [ ] Error handling present
- [ ] Proper TypeScript types

### Styling Review

- [ ] Uses semantic color classes
- [ ] Responsive design tested
- [ ] Dark mode compatible
- [ ] Uses cn() for conditional classes

### Performance Review

- [ ] No unnecessary re-renders
- [ ] Images optimized with next/image
- [ ] Heavy components lazy loaded
- [ ] Proper memoization

### Accessibility Review

- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Keyboard navigation works
- [ ] ARIA labels where needed

### Testing Review

- [ ] TypeScript errors resolved
- [ ] Lint errors resolved
- [ ] Build succeeds
- [ ] Manual testing performed

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs)
- [Zod](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
