# Component Library

Documentation for shared components in GoApps Frontend.

## DataTable

Reusable data table with loading state, empty state, and row actions.

### Import

```typescript
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | Yes | Array of data items |
| `columns` | `ColumnDef<T>[]` | Yes | Column definitions |
| `keyField` | `keyof T` | Yes | Unique identifier field |
| `actions` | `RowAction<T>[]` | No | Row action buttons |
| `isLoading` | `boolean` | No | Show loading skeleton |
| `emptyMessage` | `string` | No | Message when no data |
| `emptyDescription` | `string` | No | Description when no data |
| `skeletonRowCount` | `number` | No | Number of skeleton rows |

### ColumnDef

```typescript
interface ColumnDef<TData> {
  id: string                          // Unique column ID
  header: string                      // Header text
  accessorKey?: keyof TData           // Key to access data
  cell?: (row: TData) => ReactNode    // Custom cell renderer
  width?: string                      // Width class (e.g., 'w-[100px]')
  headerClassName?: string            // Header class
  cellClassName?: string              // Cell class
  hideOnMobile?: boolean              // Hide on mobile
}
```

### RowAction

```typescript
interface RowAction<TData> {
  id: string                          // Unique action ID
  label: string                       // Action label
  icon?: ReactNode                    // Icon component
  onClick: (row: TData) => void       // Click handler
  variant?: "default" | "destructive" // Button variant
  disabled?: (row: TData) => boolean  // Disable condition
}
```

### Example

```tsx
const columns: ColumnDef<User>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  {
    id: "status",
    header: "Status",
    cell: (row) => <Badge>{row.status}</Badge>,
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    hideOnMobile: true,
  },
]

const actions: RowAction<User>[] = [
  {
    id: "edit",
    label: "Edit",
    icon: <Pencil className="h-4 w-4" />,
    onClick: (user) => handleEdit(user),
  },
  {
    id: "delete",
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (user) => handleDelete(user),
    variant: "destructive",
  },
]

<DataTable
  data={users}
  columns={columns}
  keyField="id"
  actions={actions}
  isLoading={isLoading}
  emptyMessage="No users found"
/>
```

---

## DataTablePagination

Pagination controls with page size selector.

### Import

```typescript
import { DataTablePagination } from "@/components/shared"
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentPage` | `number` | Yes | Current page (1-indexed) |
| `pageSize` | `number` | Yes | Items per page |
| `totalItems` | `number` | Yes | Total item count |
| `totalPages` | `number` | Yes | Total page count |
| `onPageChange` | `(page: number) => void` | Yes | Page change handler |
| `onPageSizeChange` | `(size: number) => void` | Yes | Page size handler |
| `pageSizeOptions` | `number[]` | No | Available page sizes |

### Example

```tsx
<DataTablePagination
  currentPage={1}
  pageSize={10}
  totalItems={100}
  totalPages={10}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

---

## ConfirmDialog

Confirmation dialog with variants for different actions.

### Import

```typescript
import { ConfirmDialog } from "@/components/shared"
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Open state |
| `onOpenChange` | `(open: boolean) => void` | Yes | Open change handler |
| `title` | `string` | Yes | Dialog title |
| `description` | `string` | Yes | Dialog description |
| `variant` | `"default" \| "destructive" \| "warning" \| "success"` | No | Color variant |
| `isLoading` | `boolean` | No | Loading state |
| `confirmText` | `string` | No | Confirm button text |
| `cancelText` | `string` | No | Cancel button text |
| `onConfirm` | `() => void \| Promise<void>` | Yes | Confirm handler |

### Variants

- **default**: Blue info icon, primary button
- **destructive**: Red warning icon, destructive button
- **warning**: Yellow warning icon, yellow button
- **success**: Green check icon, green button

### Example

```tsx
<ConfirmDialog
  open={showDelete}
  onOpenChange={setShowDelete}
  title="Delete User"
  description="Are you sure you want to delete this user? This action cannot be undone."
  variant="destructive"
  isLoading={isDeleting}
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
/>
```

---

## FormDialog

Dialog wrapper for forms with submit/cancel buttons.

### Import

```typescript
import { FormDialog } from "@/components/shared"
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Open state |
| `onOpenChange` | `(open: boolean) => void` | Yes | Open change handler |
| `title` | `string` | Yes | Dialog title |
| `description` | `string` | No | Dialog description |
| `children` | `ReactNode` | Yes | Form content |
| `isLoading` | `boolean` | No | Loading state |
| `submitText` | `string` | No | Submit button text |
| `cancelText` | `string` | No | Cancel button text |
| `onSubmit` | `() => void \| Promise<void>` | Yes | Submit handler |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | No | Dialog width |

### Example

```tsx
<FormDialog
  open={showForm}
  onOpenChange={setShowForm}
  title="Add User"
  description="Fill in the user details"
  isLoading={isPending}
  submitText="Create"
  onSubmit={handleSubmit}
  size="md"
>
  <div className="space-y-4">
    <Input placeholder="Name" value={name} onChange={setName} />
    <Input placeholder="Email" value={email} onChange={setEmail} />
  </div>
</FormDialog>
```

---

## SearchFilters

Search input with filter dropdowns.

### Import

```typescript
import { SearchFilters, type FilterDef } from "@/components/shared"
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchPlaceholder` | `string` | No | Search input placeholder |
| `initialSearch` | `string` | No | Initial search value |
| `onSearch` | `(value: string) => void` | Yes | Search handler |
| `filters` | `FilterDef[]` | No | Filter definitions |
| `initialFilters` | `FilterValues` | No | Initial filter values |
| `onFilterChange` | `(filters: FilterValues) => void` | No | Filter change handler |
| `debounceMs` | `number` | No | Search debounce (ms) |
| `className` | `string` | No | Additional class name |

### FilterDef

```typescript
interface FilterDef<T = string | number> {
  id: string                              // Filter ID
  label: string                           // Filter label
  options: { value: T; label: string }[]  // Options
  defaultValue?: T                        // Default value
  placeholder?: string                    // Placeholder
}
```

### Example

```tsx
const filters: FilterDef[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "", label: "All" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    id: "category",
    label: "Category",
    options: [
      { value: "", label: "All Categories" },
      { value: "1", label: "Category 1" },
      { value: "2", label: "Category 2" },
    ],
  },
]

<SearchFilters
  searchPlaceholder="Search users..."
  onSearch={(value) => setSearch(value)}
  filters={filters}
  onFilterChange={(values) => setFilters(values)}
  debounceMs={300}
/>
```

---

## ErrorBoundary

Error boundary for catching render errors.

### Import

```typescript
import { ErrorBoundary, ErrorFallback } from "@/components/shared"
```

### ErrorBoundary Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Child components |
| `fallback` | `ReactNode` | No | Custom fallback UI |
| `onError` | `(error: Error, info: ErrorInfo) => void` | No | Error handler |
| `showErrorDetails` | `boolean` | No | Show error details |

### Example

```tsx
<ErrorBoundary
  onError={(error, info) => logError(error, info)}
  showErrorDetails={process.env.NODE_ENV === "development"}
>
  <App />
</ErrorBoundary>
```

### ErrorFallback

Simple error display component:

```tsx
<ErrorFallback
  message="Failed to load data"
  onRetry={() => refetch()}
/>
```
