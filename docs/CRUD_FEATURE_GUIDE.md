# CRUD Feature Guide

Step-by-step guide to implement a new CRUD feature in GoApps Frontend.

## Prerequisites

1. Proto types generated in `/src/types/generated/`
2. Backend API endpoints ready
3. Next.js API routes configured

## Step 1: Create Types File

Create `/src/types/[module]/[feature].ts`:

```typescript
// Example: /src/types/finance/currency.ts

// Re-export proto-generated types
export {
  CurrencyStatus,
  currencyStatusFromJSON,
  currencyStatusToJSON,
} from "@/types/generated/finance/v1/currency"

export type {
  Currency,
  CreateCurrencyRequest,
  CreateCurrencyResponse,
  // ... other types
} from "@/types/generated/finance/v1/currency"

// Export parsers
export {
  Currency as CurrencyParser,
  ListCurrenciesResponse as ListCurrenciesResponseParser,
  // ...
} from "@/types/generated/finance/v1/currency"

// Re-export common types
export type { BaseResponse, PaginationResponse } from "@/types/generated/common/v1/common"

// Import enums for local use
import { CurrencyStatus } from "@/types/generated/finance/v1/currency"

// UI Display labels
export const CURRENCY_STATUS_LABELS: Record<CurrencyStatus, string> = {
  [CurrencyStatus.CURRENCY_STATUS_UNSPECIFIED]: "All",
  [CurrencyStatus.CURRENCY_STATUS_ACTIVE]: "Active",
  [CurrencyStatus.CURRENCY_STATUS_INACTIVE]: "Inactive",
  [CurrencyStatus.UNRECOGNIZED]: "Unknown",
}

// Select options
export const CURRENCY_STATUS_OPTIONS = [
  { value: CurrencyStatus.CURRENCY_STATUS_UNSPECIFIED, label: "All" },
  { value: CurrencyStatus.CURRENCY_STATUS_ACTIVE, label: "Active" },
  { value: CurrencyStatus.CURRENCY_STATUS_INACTIVE, label: "Inactive" },
]

// Simplified params for hooks
export interface ListCurrenciesParams {
  page?: number
  pageSize?: number
  search?: string
  status?: CurrencyStatus
}
```

## Step 2: Create Hooks with Factory

Create `/src/hooks/[module]/use-[feature].ts`:

```typescript
"use client"

import { createCrudHooks } from "@/lib/hooks"
import {
  type Currency,
  type CreateCurrencyRequest,
  type UpdateCurrencyRequest,
  type ListCurrenciesParams,
  type ListCurrenciesResponse,
  type CreateCurrencyResponse,
  type UpdateCurrencyResponse,
  type DeleteCurrencyResponse,
  type GetCurrencyResponse,
  ListCurrenciesResponseParser,
  CreateCurrencyResponseParser,
  UpdateCurrencyResponseParser,
  DeleteCurrencyResponseParser,
  GetCurrencyResponseParser,
} from "@/types/finance/currency"

const {
  useList: useCurrencies,
  useGet: useCurrency,
  useCreate: useCreateCurrency,
  useUpdate: useUpdateCurrency,
  useDelete: useDeleteCurrency,
  queryKeys: currencyKeys,
} = createCrudHooks<
  Currency,
  ListCurrenciesParams,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
  ListCurrenciesResponse,
  CreateCurrencyResponse,
  UpdateCurrencyResponse,
  DeleteCurrencyResponse,
  GetCurrencyResponse
>({
  resourceName: "Currency",
  apiBasePath: "/api/v1/finance/currencies",
  parsers: {
    listResponse: (data) => ListCurrenciesResponseParser.fromJSON(data),
    createResponse: (data) => CreateCurrencyResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateCurrencyResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteCurrencyResponseParser.fromJSON(data),
    getResponse: (data) => GetCurrencyResponseParser.fromJSON(data),
  },
  getEntityId: (currency) => currency.currencyId,
  messages: {
    createSuccess: "Currency created successfully",
    updateSuccess: "Currency updated successfully",
    deleteSuccess: "Currency deleted successfully",
  },
})

export {
  useCurrencies,
  useCurrency,
  useCreateCurrency,
  useUpdateCurrency,
  useDeleteCurrency,
  currencyKeys,
}
```

## Step 3: Create Table Component

Create `/src/components/[module]/[feature]/[feature]-table.tsx`:

```typescript
"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { type Currency, CURRENCY_STATUS_LABELS } from "@/types/finance/currency"

interface CurrencyTableProps {
  data: Currency[]
  isLoading?: boolean
  onEdit: (currency: Currency) => void
  onDelete: (currency: Currency) => void
}

export function CurrencyTable({ data, isLoading, onEdit, onDelete }: CurrencyTableProps) {
  const columns: ColumnDef<Currency>[] = [
    {
      id: "code",
      header: "Code",
      width: "w-[100px]",
      cell: (row) => <span className="font-mono">{row.currencyCode}</span>,
    },
    {
      id: "name",
      header: "Name",
      accessorKey: "currencyName",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  const actions: RowAction<Currency>[] = [
    {
      id: "edit",
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive",
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      keyField="currencyId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No currencies found"
    />
  )
}
```

## Step 4: Create Delete Dialog

Create `/src/components/[module]/[feature]/[feature]-delete-dialog.tsx`:

```typescript
"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Currency } from "@/types/finance/currency"
import { useDeleteCurrency } from "@/hooks/finance/use-currency"

interface CurrencyDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency: Currency | null
  onSuccess?: () => void
}

export function CurrencyDeleteDialog({
  open,
  onOpenChange,
  currency,
  onSuccess,
}: CurrencyDeleteDialogProps) {
  const deleteMutation = useDeleteCurrency()

  const handleDelete = async () => {
    if (!currency) return
    try {
      await deleteMutation.mutateAsync(currency.currencyId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Currency"
      description={`Are you sure you want to delete "${currency?.currencyCode}"?`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      onConfirm={handleDelete}
    />
  )
}
```

## Step 5: Create Form Dialog

Create `/src/components/[module]/[feature]/[feature]-form-dialog.tsx`:

```typescript
"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type Currency } from "@/types/finance/currency"
import { useCreateCurrency, useUpdateCurrency } from "@/hooks/finance/use-currency"

const formSchema = z.object({
  currencyCode: z.string().min(1, "Required").max(3),
  currencyName: z.string().min(1, "Required").max(100),
})

type FormValues = z.infer<typeof formSchema>

interface CurrencyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency?: Currency | null
  onSuccess?: () => void
}

export function CurrencyFormDialog({
  open, onOpenChange, currency, onSuccess
}: CurrencyFormDialogProps) {
  const isEditing = !!currency
  const createMutation = useCreateCurrency()
  const updateMutation = useUpdateCurrency()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currencyCode: "", currencyName: "" },
  })

  useEffect(() => {
    if (open && currency) {
      form.reset({
        currencyCode: currency.currencyCode,
        currencyName: currency.currencyName,
      })
    } else if (open) {
      form.reset({ currencyCode: "", currencyName: "" })
    }
  }, [open, currency, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && currency) {
        await updateMutation.mutateAsync({
          id: currency.currencyId,
          data: { currencyId: currency.currencyId, ...values },
        })
      } else {
        await createMutation.mutateAsync(values)
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save:", error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Add"} Currency</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currencyCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isEditing || isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currencyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

## Step 6: Create Page Component

Create `/src/app/[module]/[feature]/page.tsx`:

```typescript
"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DataTablePagination } from "@/components/shared"
import { CurrencyTable } from "@/components/finance/currency/currency-table"
import { CurrencyFormDialog } from "@/components/finance/currency/currency-form-dialog"
import { CurrencyDeleteDialog } from "@/components/finance/currency/currency-delete-dialog"
import { useCurrencies } from "@/hooks/finance/use-currency"
import { type Currency, type ListCurrenciesParams } from "@/types/finance/currency"

export default function CurrenciesPage() {
  const [filters, setFilters] = useState<ListCurrenciesParams>({
    page: 1,
    pageSize: 10,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Currency | null>(null)

  const { data, isLoading } = useCurrencies(filters)

  const handleEdit = (item: Currency) => {
    setSelectedItem(item)
    setFormOpen(true)
  }

  const handleDelete = (item: Currency) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Currencies</h1>
        <Button onClick={() => { setSelectedItem(null); setFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Add Currency
        </Button>
      </div>

      <Card className="p-4">
        <CurrencyTable
          data={data?.data || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <div className="mt-4">
          <DataTablePagination
            currentPage={data?.pagination.currentPage || 1}
            pageSize={data?.pagination.pageSize || 10}
            totalItems={data?.pagination.totalItems || 0}
            totalPages={data?.pagination.totalPages || 0}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
          />
        </div>
      </Card>

      <CurrencyFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        currency={selectedItem}
      />
      <CurrencyDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        currency={selectedItem}
      />
    </div>
  )
}
```

## File Structure Summary

```
src/
├── types/finance/currency.ts           # Types + UI helpers
├── hooks/finance/use-currency.ts       # CRUD hooks
├── components/finance/currency/
│   ├── currency-table.tsx
│   ├── currency-form-dialog.tsx
│   ├── currency-delete-dialog.tsx
│   ├── currency-filters.tsx
│   └── currency-pagination.tsx
└── app/finance/currencies/page.tsx     # Page component
```

## Checklist

- [ ] Proto types generated
- [ ] Types file with re-exports and UI helpers
- [ ] CRUD hooks using factory
- [ ] Table component using DataTable
- [ ] Delete dialog using ConfirmDialog
- [ ] Form dialog with Zod validation
- [ ] Filters component (if needed)
- [ ] Page component
- [ ] API routes configured
