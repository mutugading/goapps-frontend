# Panduan Lengkap: Membuat Fitur CRUD dari Awal hingga Selesai

> **Dokumen ini adalah panduan lengkap untuk developer yang ingin membuat halaman master baru di GoApps Frontend.**
> Menggunakan UOM (Unit of Measure) sebagai contoh referensi.

## Daftar Isi

1. [Pemahaman Arsitektur](#1-pemahaman-arsitektur)
2. [Prasyarat](#2-prasyarat)
3. [Alur Kerja Lengkap](#3-alur-kerja-lengkap)
4. [Langkah 1: Proto Definition (Backend)](#langkah-1-proto-definition-backend)
5. [Langkah 2: Generate TypeScript Types](#langkah-2-generate-typescript-types)
6. [Langkah 3: Buat Domain Types](#langkah-3-buat-domain-types)
7. [Langkah 4: Buat API Routes (Proxy)](#langkah-4-buat-api-routes-proxy)
8. [Langkah 5: Buat Hooks](#langkah-5-buat-hooks)
9. [Langkah 6: Buat Components](#langkah-6-buat-components)
10. [Langkah 7: Buat Page](#langkah-7-buat-page)
11. [Langkah 8: Tambahkan ke Navigasi](#langkah-8-tambahkan-ke-navigasi)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)

---

## 1. Pemahaman Arsitektur

### Diagram Alur Data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (React)                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │   Page      │──▶│  Component  │──▶│    Hook     │──▶│ API Client  │     │
│  │ (page.tsx)  │   │ (table.tsx) │   │ (use-*.ts)  │   │ (client.ts) │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └──────┬──────┘     │
└────────────────────────────────────────────────────────────────┼────────────┘
                                                                 │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS SERVER (API Routes)                         │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  /api/v1/finance/uoms/route.ts  (Proxy Handler)                 │       │
│  │  - Forward request ke backend                                    │       │
│  │  - Forward auth headers & cookies                               │       │
│  └─────────────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────┬────────────┘
                                                                 │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GOLANG BACKEND                                      │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │  gRPC-Gateway   │──▶│   gRPC Service  │──▶│    Database     │           │
│  │  (HTTP → gRPC)  │   │   (business)    │   │   (PostgreSQL)  │           │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Penjelasan Layer

| Layer | Lokasi | Fungsi |
|-------|--------|--------|
| **Page** | `src/app/(dashboard)/finance/uoms/page.tsx` | Entry point, state management, layout |
| **Components** | `src/components/finance/uom/*.tsx` | UI (table, form, dialog, filters) |
| **Hooks** | `src/hooks/finance/use-uom.ts` | Data fetching dengan TanStack Query |
| **API Client** | `src/lib/api/client.ts` | HTTP client dengan retry & timeout |
| **API Routes** | `src/app/api/v1/finance/uoms/route.ts` | Proxy ke backend |
| **Types** | `src/types/finance/uom.ts` | Domain types & UI helpers |
| **Generated Types** | `src/types/generated/finance/v1/uom.ts` | Auto-generated dari proto |

### Query Keys (Hierarchical)

Query keys digunakan TanStack Query untuk caching. Format:

```typescript
["service", "resource", "operation", params]

// Contoh:
["finance", "uom", "list", { page: 1, search: "KG" }]
["finance", "uom", "detail", "uom-123"]
["purchase", "vendor", "list", { page: 1 }]
```

Keuntungan hierarchical:
- Tidak ada collision antar service
- Mudah invalidate per service: `queryClient.invalidateQueries({ queryKey: ["finance"] })`

---

## 2. Prasyarat

### Yang Harus Sudah Siap

- [ ] Proto file sudah dibuat di `goapps-shared-proto/finance/v1/uom.proto`
- [ ] Backend sudah implement gRPC service
- [ ] Backend sudah running (default: `http://localhost:8080`)
- [ ] Frontend dependencies sudah terinstall (`npm install`)

### Tools yang Digunakan

| Tool | Kegunaan |
|------|----------|
| `buf` | Generate TypeScript types dari proto |
| `ts-proto` | Proto compiler untuk TypeScript |
| `TanStack Query` | Data fetching, caching, sync |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `sonner` | Toast notifications |

---

## 3. Alur Kerja Lengkap

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. PROTO READY                                                          │
│     (Backend team sudah buat proto di goapps-shared-proto)               │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. GENERATE TYPES                                                       │
│     npm run generate:proto                                               │
│     Output: src/types/generated/finance/v1/uom.ts                        │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. DOMAIN TYPES                                                         │
│     Buat: src/types/finance/uom.ts                                       │
│     - Re-export proto types                                              │
│     - UI labels & options                                                │
│     - Form defaults                                                      │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. API ROUTES                                                           │
│     Buat: src/app/api/v1/finance/uoms/route.ts                           │
│     - Proxy handler untuk forward request ke backend                     │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5. HOOKS                                                                │
│     Buat: src/hooks/finance/use-uom.ts                                   │
│     - CRUD hooks dengan createCrudHooks factory                          │
│     - Export/import hooks                                                │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  6. COMPONENTS                                                           │
│     Buat: src/components/finance/uom/                                    │
│     - uom-table.tsx                                                      │
│     - uom-form-dialog.tsx                                                │
│     - uom-filters.tsx                                                    │
│     - uom-pagination.tsx                                                 │
│     - uom-delete-dialog.tsx                                              │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  7. PAGE                                                                 │
│     Buat: src/app/(dashboard)/finance/uoms/page.tsx                      │
│     - Gabungkan semua components                                         │
│     - State untuk dialogs                                                │
│     - Filter state                                                       │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  8. NAVIGATION                                                           │
│     Update: src/config/navigation.ts                                     │
│     - Tambahkan menu link                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Langkah 1: Proto Definition (Backend)

### 1.1 Lokasi Proto File

Proto file berada di repository `goapps-shared-proto`:

```
goapps-shared-proto/
├── common/
│   └── v1/
│       └── common.proto      # BaseResponse, Pagination, AuditInfo
├── finance/
│   └── v1/
│       └── uom.proto         # UOM entity dan service
└── buf.gen.ts.yaml           # Config untuk generate TypeScript
```

### 1.2 Struktur Proto (Contoh UOM)

```protobuf
// finance/v1/uom.proto

syntax = "proto3";
package finance.v1;

import "common/v1/common.proto";

// Entity
message UOM {
  string uom_id = 1;
  string uom_code = 2;
  string uom_name = 3;
  UOMCategory uom_category = 4;
  string description = 5;
  bool is_active = 6;
  common.v1.AuditInfo audit_info = 7;
}

// Enum
enum UOMCategory {
  UOM_CATEGORY_UNSPECIFIED = 0;
  UOM_CATEGORY_WEIGHT = 1;
  UOM_CATEGORY_LENGTH = 2;
  UOM_CATEGORY_VOLUME = 3;
  UOM_CATEGORY_QUANTITY = 4;
}

// Requests & Responses
message ListUOMsRequest {
  int32 page = 1;
  int32 page_size = 2;
  string search = 3;
  // ... filters
}

message ListUOMsResponse {
  common.v1.BaseResponse base = 1;
  repeated UOM data = 2;
  common.v1.PaginationResponse pagination = 3;
}

// Service definition (untuk gRPC)
service UOMService {
  rpc ListUOMs(ListUOMsRequest) returns (ListUOMsResponse);
  rpc CreateUOM(CreateUOMRequest) returns (CreateUOMResponse);
  // ... CRUD methods
}
```

### 1.3 Poin Penting

- **snake_case** di proto akan menjadi **camelCase** di TypeScript
- `string uom_id` → `uomId: string`
- Semua response harus punya `base: common.v1.BaseResponse`
- List response harus punya `pagination: common.v1.PaginationResponse`

---

## Langkah 2: Generate TypeScript Types

### 2.1 Jalankan Generator

```bash
# Dari directory goapps-frontend
npm run generate:proto

# Atau manual dari goapps-shared-proto
cd ../goapps-shared-proto
buf generate --template buf.gen.ts.yaml
```

### 2.2 Output

File akan di-generate ke `src/types/generated/`:

```
src/types/generated/
├── common/
│   └── v1/
│       └── common.ts       # BaseResponse, PaginationResponse, AuditInfo
├── finance/
│   └── v1/
│       └── uom.ts          # UOM, CreateUOMRequest, ListUOMsResponse, etc.
└── google/
    └── protobuf/
        └── timestamp.ts    # Timestamp handling
```

### 2.3 Isi Generated File

File yang di-generate berisi:

```typescript
// src/types/generated/finance/v1/uom.ts (auto-generated)

// Enums
export enum UOMCategory {
  UOM_CATEGORY_UNSPECIFIED = 0,
  UOM_CATEGORY_WEIGHT = 1,
  UOM_CATEGORY_LENGTH = 2,
  // ...
}

// Interfaces
export interface UOM {
  uomId: string;
  uomCode: string;
  uomName: string;
  uomCategory: UOMCategory;
  description: string;
  isActive: boolean;
  auditInfo: AuditInfo | undefined;
}

// Response interfaces
export interface ListUOMsResponse {
  base: BaseResponse | undefined;
  data: UOM[];
  pagination: PaginationResponse | undefined;
}

// Parser functions (MessageFns)
export const UOM = {
  fromJSON(object: any): UOM { ... },
  toJSON(message: UOM): unknown { ... },
  // ...
}

export const ListUOMsResponse = {
  fromJSON(object: any): ListUOMsResponse { ... },
  toJSON(message: ListUOMsResponse): unknown { ... },
  // ...
}
```

### 2.4 Penting: JANGAN EDIT FILE GENERATED!

File di `src/types/generated/` adalah **READ-ONLY**:
- Ada header `// Code generated by protoc-gen-ts_proto. DO NOT EDIT.`
- VS Code akan menampilkan sebagai read-only (sudah dikonfigurasi)
- Perubahan akan hilang saat generate ulang

---

## Langkah 3: Buat Domain Types

### 3.1 Kenapa Perlu Domain Types?

1. **Re-export** types yang dibutuhkan (tidak perlu import panjang)
2. **UI Labels** untuk display (enum → readable text)
3. **Form Options** untuk dropdown/select
4. **Simplified Params** untuk hooks
5. **Default Values** untuk form

### 3.2 Buat File Types

```bash
# Buat file (atau gunakan generator)
mkdir -p src/types/finance
touch src/types/finance/uom.ts
```

### 3.3 Isi Domain Types

```typescript
// src/types/finance/uom.ts

// =============================================================================
// Re-export dari generated types
// =============================================================================

export {
  // Entity type
  type UOM,

  // Enum
  UOMCategory,

  // Request types
  type CreateUOMRequest,
  type UpdateUOMRequest,
  type ListUOMsRequest,
  type ExportUOMsRequest,
  type ImportUOMsRequest,

  // Response types
  type CreateUOMResponse,
  type UpdateUOMResponse,
  type DeleteUOMResponse,
  type GetUOMResponse,
  type ListUOMsResponse,
  type ExportUOMsResponse,
  type ImportUOMsResponse,
  type DownloadTemplateResponse,

  // Parser functions (untuk fromJSON)
  UOM as UOMParser,
  CreateUOMResponse as CreateUOMResponseParser,
  UpdateUOMResponse as UpdateUOMResponseParser,
  DeleteUOMResponse as DeleteUOMResponseParser,
  GetUOMResponse as GetUOMResponseParser,
  ListUOMsResponse as ListUOMsResponseParser,
  ExportUOMsResponse as ExportUOMsResponseParser,
  ImportUOMsResponse as ImportUOMsResponseParser,
  DownloadTemplateResponse as DownloadTemplateResponseParser,
} from "@/types/generated/finance/v1/uom"

// Import enum untuk digunakan di bawah
import { UOMCategory } from "@/types/generated/finance/v1/uom"

// =============================================================================
// UI Display Labels - untuk tampilkan di tabel, badge, dll
// =============================================================================

export const UOM_CATEGORY_LABELS: Record<UOMCategory, string> = {
  [UOMCategory.UOM_CATEGORY_UNSPECIFIED]: "All Categories",
  [UOMCategory.UOM_CATEGORY_WEIGHT]: "Weight",
  [UOMCategory.UOM_CATEGORY_LENGTH]: "Length",
  [UOMCategory.UOM_CATEGORY_VOLUME]: "Volume",
  [UOMCategory.UOM_CATEGORY_QUANTITY]: "Quantity",
  [UOMCategory.UNRECOGNIZED]: "Unknown",
}

// =============================================================================
// Form Options - untuk Select dropdown
// =============================================================================

// Untuk filter (include "All")
export const UOM_CATEGORY_FILTER_OPTIONS = [
  { value: UOMCategory.UOM_CATEGORY_UNSPECIFIED, label: "All Categories" },
  { value: UOMCategory.UOM_CATEGORY_WEIGHT, label: "Weight" },
  { value: UOMCategory.UOM_CATEGORY_LENGTH, label: "Length" },
  { value: UOMCategory.UOM_CATEGORY_VOLUME, label: "Volume" },
  { value: UOMCategory.UOM_CATEGORY_QUANTITY, label: "Quantity" },
]

// Untuk form create/edit (exclude "Unspecified")
export const UOM_CATEGORY_FORM_OPTIONS = [
  { value: UOMCategory.UOM_CATEGORY_WEIGHT, label: "Weight" },
  { value: UOMCategory.UOM_CATEGORY_LENGTH, label: "Length" },
  { value: UOMCategory.UOM_CATEGORY_VOLUME, label: "Volume" },
  { value: UOMCategory.UOM_CATEGORY_QUANTITY, label: "Quantity" },
]

// =============================================================================
// Simplified Params - untuk hooks (lebih simpel dari proto request)
// =============================================================================

export interface ListUOMsParams {
  page?: number
  pageSize?: number
  search?: string
  category?: UOMCategory
  isActive?: boolean
  sortBy?: "code" | "name" | "category" | "created_at"
  sortOrder?: "asc" | "desc"
}

export interface ExportUOMsParams {
  search?: string
  category?: UOMCategory
  isActive?: boolean
}

// =============================================================================
// Form Data - untuk react-hook-form
// =============================================================================

export interface UOMFormData {
  uomCode: string
  uomName: string
  uomCategory: UOMCategory
  description: string
  isActive: boolean
}

export const DEFAULT_UOM_FORM_VALUES: UOMFormData = {
  uomCode: "",
  uomName: "",
  uomCategory: UOMCategory.UOM_CATEGORY_WEIGHT, // Default ke Weight
  description: "",
  isActive: true,
}
```

### 3.4 Penjelasan Bagian-bagian

| Bagian | Fungsi | Contoh Penggunaan |
|--------|--------|-------------------|
| Re-export types | Import lebih singkat | `import { UOM } from "@/types/finance/uom"` |
| Parser exports | Parse JSON response | `ListUOMsResponseParser.fromJSON(data)` |
| Labels | Display di UI | `UOM_CATEGORY_LABELS[item.uomCategory]` |
| Filter Options | Dropdown dengan "All" | `<Select options={UOM_CATEGORY_FILTER_OPTIONS}>` |
| Form Options | Dropdown tanpa "All" | `<Select options={UOM_CATEGORY_FORM_OPTIONS}>` |
| Simplified Params | Hook parameters | `useUOMs({ page: 1, search: "KG" })` |
| Form Data | Form state type | `useForm<UOMFormData>()` |
| Default Values | Reset form | `form.reset(DEFAULT_UOM_FORM_VALUES)` |

---

## Langkah 4: Buat API Routes (Proxy)

### 4.1 Penjelasan

Next.js API routes berfungsi sebagai **proxy** ke backend:
- Browser tidak bisa langsung akses backend (CORS, security)
- API routes forward request + auth headers
- Memudahkan switch backend URL via environment variable

### 4.2 Struktur Folder

```
src/app/api/v1/finance/uoms/
├── route.ts              # GET (list) & POST (create)
├── [uomId]/
│   └── route.ts          # GET, PUT, DELETE (single item)
├── export/
│   └── route.ts          # GET (export to Excel)
├── import/
│   └── route.ts          # POST (import from Excel)
└── template/
    └── route.ts          # GET (download template)
```

### 4.3 Implementasi dengan Proxy Handler

Gunakan `createProxyHandlers` utility untuk mengurangi boilerplate:

```typescript
// src/app/api/v1/finance/uoms/route.ts

import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,           // Service config (URL dari env)
  basePath: "/api/v1/finance/uoms",    // Path di backend
  resourceName: "unit of measure",      // Untuk error message
})

// GET /api/v1/finance/uoms - List dengan filters
export const GET = proxy.list()

// POST /api/v1/finance/uoms - Create baru
export const POST = proxy.create()
```

```typescript
// src/app/api/v1/finance/uoms/[uomId]/route.ts

import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

// GET /api/v1/finance/uoms/[uomId] - Get single
export const GET = proxy.get("uomId")     // "uomId" = nama param di URL

// PUT /api/v1/finance/uoms/[uomId] - Update
export const PUT = proxy.update("uomId")

// DELETE /api/v1/finance/uoms/[uomId] - Delete
export const DELETE = proxy.delete("uomId")
```

```typescript
// src/app/api/v1/finance/uoms/export/route.ts
import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

export const GET = proxy.export()
```

```typescript
// src/app/api/v1/finance/uoms/import/route.ts
import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

export const POST = proxy.import()
```

```typescript
// src/app/api/v1/finance/uoms/template/route.ts
import { createProxyHandlers, SERVICES } from "@/lib/api"

const proxy = createProxyHandlers({
  service: SERVICES.FINANCE,
  basePath: "/api/v1/finance/uoms",
  resourceName: "unit of measure",
})

export const GET = proxy.template()
```

### 4.4 Service Configuration

Service URL dikonfigurasi via environment variable:

```env
# .env.local
FINANCE_SERVICE_URL=http://localhost:8080
PURCHASE_SERVICE_URL=http://localhost:8081
```

Available services di `SERVICES`:
- `SERVICES.FINANCE` → `FINANCE_SERVICE_URL`
- `SERVICES.PURCHASE` → `PURCHASE_SERVICE_URL`
- `SERVICES.SALES` → `SALES_SERVICE_URL`
- `SERVICES.INVENTORY` → `INVENTORY_SERVICE_URL`
- `SERVICES.IAM` → `IAM_SERVICE_URL`

---

## Langkah 5: Buat Hooks

### 5.1 Penjelasan

Hooks menggunakan TanStack Query untuk:
- **Caching** - data di-cache, tidak fetch ulang terus-menerus
- **Background sync** - auto refetch saat focus window
- **Optimistic updates** - UI update dulu, rollback jika error
- **Query invalidation** - refresh data setelah mutation

### 5.2 Buat File Hooks

```typescript
// src/hooks/finance/use-uom.ts
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type UOM,
  type CreateUOMRequest,
  type UpdateUOMRequest,
  type ListUOMsParams,
  type ExportUOMsParams,
  type ListUOMsResponse,
  type CreateUOMResponse,
  type UpdateUOMResponse,
  type DeleteUOMResponse,
  type GetUOMResponse,
  type ExportUOMsResponse,
  type ImportUOMsResponse,
  type DownloadTemplateResponse,
  ListUOMsResponseParser,
  CreateUOMResponseParser,
  UpdateUOMResponseParser,
  DeleteUOMResponseParser,
  GetUOMResponseParser,
  ExportUOMsResponseParser,
  ImportUOMsResponseParser,
  DownloadTemplateResponseParser,
} from "@/types/finance/uom"

// ============================================================================
// CRUD Hooks dari Factory
// ============================================================================

const {
  useList: useUOMs,           // Hook untuk list dengan pagination
  useGet: useUOM,             // Hook untuk get single by ID
  useCreate: useCreateUOM,    // Hook untuk create
  useUpdate: useUpdateUOM,    // Hook untuk update
  useDelete: useDeleteUOM,    // Hook untuk delete
  queryKeys: uomKeys,         // Query keys untuk cache management
} = createCrudHooks<
  UOM,                    // Entity type
  ListUOMsParams,         // List params type
  CreateUOMRequest,       // Create request type
  UpdateUOMRequest,       // Update request type
  ListUOMsResponse,       // List response type
  CreateUOMResponse,      // Create response type
  UpdateUOMResponse,      // Update response type
  DeleteUOMResponse,      // Delete response type
  GetUOMResponse          // Get response type
>({
  serviceScope: "finance",                    // Hierarchical query key prefix
  resourceName: "UOM",                        // Untuk messages & query keys
  apiBasePath: "/api/v1/finance/uoms",        // Base path untuk API calls
  parsers: {
    // Parser functions dari proto-generated
    listResponse: (data) => ListUOMsResponseParser.fromJSON(data),
    createResponse: (data) => CreateUOMResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateUOMResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteUOMResponseParser.fromJSON(data),
    getResponse: (data) => GetUOMResponseParser.fromJSON(data),
  },
  getEntityId: (uom) => uom.uomId,           // Fungsi untuk extract ID dari entity
  messages: {
    createSuccess: "UOM created successfully",
    updateSuccess: "UOM updated successfully",
    deleteSuccess: "UOM deleted successfully",
  },
})

// Export CRUD hooks
export { useUOMs, useUOM, useCreateUOM, useUpdateUOM, useDeleteUOM, uomKeys }

// ============================================================================
// Export Hook - Download Excel
// ============================================================================

export function useExportUOMs() {
  return useMutation({
    mutationFn: async (params: ExportUOMsParams = {}): Promise<ExportUOMsResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(
        `/api/v1/finance/uoms/export${queryString}`
      )
      return ExportUOMsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        // Download file dari Uint8Array
        downloadFileFromBytes(
          response.fileContent,
          response.fileName || "uoms-export.xlsx"
        )
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export UOMs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export UOMs")
    },
  })
}

// ============================================================================
// Import Hook - Upload Excel
// ============================================================================

interface ImportData {
  fileContent: Uint8Array
  fileName: string
  duplicateAction: "skip" | "update" | "error"
}

export function useImportUOMs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportUOMsResponse> => {
      const rawResponse = await apiClient.post<unknown>(
        "/api/v1/finance/uoms/import",
        {
          fileContent: Array.from(data.fileContent), // Convert ke array untuk JSON
          fileName: data.fileName,
          duplicateAction: data.duplicateAction,
        }
      )
      return ImportUOMsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      // Invalidate list query untuk refresh data
      queryClient.invalidateQueries({ queryKey: uomKeys.lists() })

      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ` +
          `${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import UOMs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import UOMs")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>(
        "/api/v1/finance/uoms/template"
      )
      return DownloadTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(
          response.fileContent,
          response.fileName || "uom-template.xlsx"
        )
        toast.success("Template downloaded successfully")
      } else {
        toast.error(response.base?.message || "Failed to download template")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download template")
    },
  })
}
```

### 5.3 Cara Menggunakan Hooks

```typescript
// Di component
import {
  useUOMs,
  useCreateUOM,
  useUpdateUOM,
  useDeleteUOM,
  useExportUOMs,
} from "@/hooks/finance/use-uom"

function MyComponent() {
  // List dengan params
  const { data, isLoading, error } = useUOMs({
    page: 1,
    pageSize: 10,
    search: "KG",
  })

  // Create mutation
  const createMutation = useCreateUOM()
  const handleCreate = () => {
    createMutation.mutate({
      uomCode: "KG",
      uomName: "Kilogram",
      uomCategory: 1,
      isActive: true,
    })
  }

  // Update mutation
  const updateMutation = useUpdateUOM()
  const handleUpdate = () => {
    updateMutation.mutate({
      id: "uom-123",
      data: { uomName: "Kilogram Updated" },
    })
  }

  // Delete mutation
  const deleteMutation = useDeleteUOM()
  const handleDelete = () => {
    deleteMutation.mutate("uom-123")
  }

  // Export
  const exportMutation = useExportUOMs()
  const handleExport = () => {
    exportMutation.mutate({ search: "KG" })
  }

  // Akses data
  const items = data?.data || []
  const pagination = data?.pagination
}
```

---

## Langkah 6: Buat Components

### 6.1 Struktur Folder Components

```
src/components/finance/uom/
├── index.ts                  # Barrel export
├── uom-table.tsx             # Tabel dengan kolom dan aksi
├── uom-form-dialog.tsx       # Dialog create/edit
├── uom-delete-dialog.tsx     # Dialog konfirmasi hapus
├── uom-filters.tsx           # Search, filter, sort controls
├── uom-pagination.tsx        # Pagination controls
└── uom-import-dialog.tsx     # Dialog import Excel
```

### 6.2 Component: Table

```typescript
// src/components/finance/uom/uom-table.tsx
"use client"

import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type UOM, UOM_CATEGORY_LABELS } from "@/types/finance/uom"

interface UOMTableProps {
  data: UOM[]
  isLoading?: boolean
  onEdit: (uom: UOM) => void
  onDelete: (uom: UOM) => void
}

export function UOMTable({ data, isLoading, onEdit, onDelete }: UOMTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No UOMs found</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((uom) => (
            <TableRow key={uom.uomId}>
              <TableCell className="font-mono font-medium">
                {uom.uomCode}
              </TableCell>
              <TableCell>{uom.uomName}</TableCell>
              <TableCell>
                {UOM_CATEGORY_LABELS[uom.uomCategory]}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {uom.description}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    uom.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {uom.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(uom)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(uom)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### 6.3 Component: Form Dialog

```typescript
// src/components/finance/uom/uom-form-dialog.tsx
"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useCreateUOM, useUpdateUOM } from "@/hooks/finance/use-uom"
import {
  type UOM,
  UOMCategory,
  UOM_CATEGORY_FORM_OPTIONS,
  DEFAULT_UOM_FORM_VALUES,
} from "@/types/finance/uom"

// Validation schema dengan Zod
const uomFormSchema = z.object({
  uomCode: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be at most 20 characters")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Code must start with uppercase letter, contain only uppercase letters, numbers, and underscores"
    ),
  uomName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  uomCategory: z.nativeEnum(UOMCategory),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters"),
  isActive: z.boolean(),
})

type UOMFormValues = z.infer<typeof uomFormSchema>

interface UOMFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom?: UOM | null  // Jika ada = edit mode, null = create mode
}

export function UOMFormDialog({ open, onOpenChange, uom }: UOMFormDialogProps) {
  const isEditing = !!uom
  const createMutation = useCreateUOM()
  const updateMutation = useUpdateUOM()

  // Setup form dengan react-hook-form + Zod
  const form = useForm<UOMFormValues>({
    resolver: zodResolver(uomFormSchema) as never,  // Cast untuk Zod v4 compat
    defaultValues: DEFAULT_UOM_FORM_VALUES,
  })

  // Reset form ketika dialog dibuka atau uom berubah
  useEffect(() => {
    if (open) {
      if (uom) {
        // Edit mode - isi form dengan data existing
        form.reset({
          uomCode: uom.uomCode || "",
          uomName: uom.uomName || "",
          uomCategory: uom.uomCategory || UOMCategory.UOM_CATEGORY_WEIGHT,
          description: uom.description || "",
          isActive: uom.isActive ?? true,
        })
      } else {
        // Create mode - reset ke default
        form.reset(DEFAULT_UOM_FORM_VALUES)
      }
    }
  }, [open, uom, form])

  const onSubmit = async (data: UOMFormValues) => {
    try {
      if (isEditing && uom) {
        await updateMutation.mutateAsync({
          id: uom.uomId,
          data: {
            uomCode: data.uomCode,
            uomName: data.uomName,
            uomCategory: data.uomCategory,
            description: data.description,
            isActive: data.isActive,
          },
        })
      } else {
        await createMutation.mutateAsync({
          uomCode: data.uomCode,
          uomName: data.uomName,
          uomCategory: data.uomCategory,
          description: data.description,
          isActive: data.isActive,
        })
      }
      onOpenChange(false)
    } catch (error) {
      // Error already handled by mutation (toast)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"} Unit of Measure</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the unit of measure details below."
              : "Fill in the details to create a new unit of measure."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="uomCode">Code *</Label>
            <Input
              id="uomCode"
              {...form.register("uomCode")}
              placeholder="e.g., KG, MTR, LTR"
              disabled={isEditing} // Code tidak bisa diedit
            />
            {form.formState.errors.uomCode && (
              <p className="text-sm text-destructive">
                {form.formState.errors.uomCode.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="uomName">Name *</Label>
            <Input
              id="uomName"
              {...form.register("uomName")}
              placeholder="e.g., Kilogram, Meter, Liter"
            />
            {form.formState.errors.uomName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.uomName.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="uomCategory">Category *</Label>
            <Select
              value={form.watch("uomCategory").toString()}
              onValueChange={(value) =>
                form.setValue("uomCategory", parseInt(value) as UOMCategory)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {UOM_CATEGORY_FORM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.uomCategory && (
              <p className="text-sm text-destructive">
                {form.formState.errors.uomCategory.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter description (optional)"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 6.4 Component: Delete Dialog

```typescript
// src/components/finance/uom/uom-delete-dialog.tsx
"use client"

import { Loader2 } from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteUOM } from "@/hooks/finance/use-uom"
import { type UOM } from "@/types/finance/uom"

interface UOMDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom: UOM | null
}

export function UOMDeleteDialog({ open, onOpenChange, uom }: UOMDeleteDialogProps) {
  const deleteMutation = useDeleteUOM()

  const handleDelete = async () => {
    if (!uom) return

    try {
      await deleteMutation.mutateAsync(uom.uomId)
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Unit of Measure</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{uom?.uomCode}</strong> ({uom?.uomName})?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 6.5 Component: Filters (GUNAKAN DebouncedSearchInput!)

```typescript
// src/components/finance/uom/uom-filters.tsx
"use client"

import { useCallback } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
// ✅ PENTING: Import DebouncedSearchInput, bukan Input biasa!
import { DebouncedSearchInput } from "@/components/common"

import {
  UOMCategory,
  UOM_CATEGORY_FILTER_OPTIONS,
  type ListUOMsParams,
} from "@/types/finance/uom"

interface UOMFiltersProps {
  filters: ListUOMsParams
  onFiltersChange: (filters: ListUOMsParams) => void
}

export function UOMFilters({ filters, onFiltersChange }: UOMFiltersProps) {
  // Memoize handler untuk prevent re-render
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 })
    },
    [filters, onFiltersChange]
  )

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: Number(value) as UOMCategory,
      page: 1,
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
      search: "",
      category: UOMCategory.UOM_CATEGORY_UNSPECIFIED,
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.category && filters.category !== UOMCategory.UOM_CATEGORY_UNSPECIFIED)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* ✅ BENAR: Gunakan DebouncedSearchInput untuk search */}
      <DebouncedSearchInput
        value={filters.search || ""}
        onValueChange={handleSearchChange}
        placeholder="Search code, name, description..."
        debounceMs={300}
        containerClassName="flex-1 sm:max-w-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        {/* Select tidak perlu debounce karena single click */}
        <Select
          value={String(filters.category ?? UOMCategory.UOM_CATEGORY_UNSPECIFIED)}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {UOM_CATEGORY_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
```

### 6.6 Component: Barrel Export

```typescript
// src/components/finance/uom/index.ts
export { UOMTable } from "./uom-table"
export { UOMFormDialog } from "./uom-form-dialog"
export { UOMDeleteDialog } from "./uom-delete-dialog"
export { UOMFilters } from "./uom-filters"
export { UOMPagination } from "./uom-pagination"
export { UOMImportDialog } from "./uom-import-dialog"
```

---

## Langkah 7: Buat Page

### 7.1 Lokasi Page

```
src/app/(dashboard)/finance/uoms/page.tsx
```

`(dashboard)` adalah route group yang memberikan layout dashboard.

### 7.2 URL State Management (PENTING!)

**WAJIB** gunakan `useUrlState` untuk filter state agar:
- State tersimpan di URL
- State tidak hilang saat reload halaman
- User bisa share URL dengan filter yang sama

```typescript
import { useUrlState } from "@/lib/hooks"

// ✅ BENAR - Filter state tersimpan di URL
const [filters, setFilters] = useUrlState({
  defaultValues: {
    page: 1,
    pageSize: 10,
    search: "",
    category: UOMCategory.UOM_CATEGORY_UNSPECIFIED,
    // ... other filters
  },
})

// ❌ SALAH - Filter state hilang saat reload
const [filters, setFilters] = useState({ ... })
```

### 7.3 Debounced Search Input (SANGAT PENTING!)

**JANGAN** gunakan `<Input>` langsung untuk search yang terhubung ke URL state!

Ini akan menyebabkan:
- **Keystroke dropping** - mengetik "tesad" hanya terinput "ead"
- **Performance lambat** - setiap keystroke = URL update = network request
- **UI tidak responsif** - input terasa lag

**GUNAKAN** `DebouncedSearchInput`:

```tsx
import { DebouncedSearchInput } from "@/components/common"

// ✅ BENAR - Search dengan debounce
<DebouncedSearchInput
  value={filters.search || ""}
  onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
  placeholder="Search code, name, description..."
  debounceMs={300}
/>

// ❌ SALAH - Langsung update URL setiap keystroke
<Input
  value={filters.search}
  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
/>
```

**Cara kerja `DebouncedSearchInput`:**
1. User mengetik → Local state langsung update (UI responsif)
2. User berhenti mengetik 300ms → Baru sync ke URL state
3. URL change dari luar (browser back/forward) → Auto-sync ke local state

**Kapan perlu debounce?**
| Input | Debounce? | Alasan |
|-------|-----------|--------|
| Search text | ✅ Ya | User mengetik cepat |
| Select dropdown | ❌ Tidak | Single click |
| Sort | ❌ Tidak | Single click |
| Pagination | ❌ Tidak | Single click |

### 7.4 Implementasi Page

```typescript
// src/app/(dashboard)/finance/uoms/page.tsx
"use client"

import { useState, Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UOMTable,
  UOMFormDialog,
  UOMDeleteDialog,
  UOMFilters,
  UOMPagination,
  UOMImportDialog,
} from "@/components/finance/uom"
import { useUOMs } from "@/hooks/finance/use-uom"
import { useUrlState } from "@/lib/hooks"  // ← PENTING: Gunakan useUrlState
import { type UOM, type ListUOMsParams, UOMCategory } from "@/types/finance/uom"

// Default filter values
const defaultFilters: ListUOMsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  category: UOMCategory.UOM_CATEGORY_UNSPECIFIED,
  sortBy: "code",
  sortOrder: "asc",
}

function UOMsPageContent() {
  // ============================================================================
  // State
  // ============================================================================

  // ✅ Filter state tersimpan di URL (tidak hilang saat reload)
  const [filters, setFilters] = useUrlState<ListUOMsParams>({
    defaultValues: defaultFilters,
  })

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedUOM, setSelectedUOM] = useState<UOM | null>(null)

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data, isLoading, error } = useUOMs(filters)

  // ============================================================================
  // Handlers
  // ============================================================================

  // Filter handlers
  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search, page: 1 }) // Reset to page 1 on search
  }

  const handleCategoryChange = (category: UOMCategory | undefined) => {
    setFilters({
      ...filters,
      category: category ?? UOMCategory.UOM_CATEGORY_UNSPECIFIED,
      page: 1,
    })
  }

  const handleIsActiveChange = (isActive: boolean | undefined) => {
    setFilters({ ...filters, isActive, page: 1 })
  }

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setFilters({ ...filters, sortBy: sortBy as ListUOMsParams["sortBy"], sortOrder })
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, pageSize, page: 1 })
  }

  // Dialog handlers
  const handleCreate = () => {
    setSelectedUOM(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (uom: UOM) => {
    setSelectedUOM(uom)
    setFormDialogOpen(true)
  }

  const handleDelete = (uom: UOM) => {
    setSelectedUOM(uom)
    setDeleteDialogOpen(true)
  }

  const handleImport = () => {
    setImportDialogOpen(true)
  }

  // ============================================================================
  // Render
  // ============================================================================

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          Error loading data: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units of Measure</h1>
          <p className="text-muted-foreground">
            Manage unit of measure master data for your organization.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add UOM
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>UOM List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <UOMFilters
            search={filters.search || ""}
            onSearchChange={handleSearchChange}
            category={filters.category}
            onCategoryChange={handleCategoryChange}
            isActive={filters.isActive}
            onIsActiveChange={handleIsActiveChange}
            sortBy={filters.sortBy || "code"}
            onSortByChange={(sortBy) => handleSortChange(sortBy, filters.sortOrder || "asc")}
            sortOrder={filters.sortOrder || "asc"}
            onSortOrderChange={(sortOrder) => handleSortChange(filters.sortBy || "code", sortOrder)}
            onImportClick={handleImport}
          />

          {/* Table */}
          <UOMTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <UOMPagination
            currentPage={data?.pagination?.currentPage || 1}
            totalPages={data?.pagination?.totalPages || 1}
            pageSize={data?.pagination?.pageSize || 10}
            totalItems={data?.pagination?.totalItems || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UOMFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        uom={selectedUOM}
      />

      <UOMDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        uom={selectedUOM}
      />

      <UOMImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  )
}

// ============================================================================
// PENTING: Wrap dengan Suspense karena useUrlState menggunakan useSearchParams
// ============================================================================
export default function UOMsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UOMsPageContent />
    </Suspense>
  )
}
```

---

## Langkah 8: Tambahkan ke Navigasi

### 8.1 Struktur Menu (3 Level)

Sidebar mendukung menu 3 level:

```
Level 1: Module      (Finance)         → icon, URL ke module dashboard
Level 2: Category    (Master)          → icon, TANPA URL (grouping saja)
Level 3: Page/Leaf   (Unit of Measure) → URL (halaman aktual)
```

### 8.2 Update Navigation Config

Tambahkan menu item di `src/config/navigation.ts`:

```typescript
// Contoh: Menambahkan "Currency" di bawah Finance > Master
// Cari children dari finance-master, tambahkan:
{
  id: "finance-master-currency",
  title: "Currency",
  url: "/finance/master/currency",
  permission: "finance.master.currency.view",
  order: 3,
  isVisible: true,
},
```

### 8.3 Update Breadcrumb Config

Tambahkan breadcrumb entry di `breadcrumbConfig` (file yang sama):

```typescript
export const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  // ... existing entries
  "/finance/master/currency": { title: "Currency" },
}
```

**Catatan**: Jika halaman ada di navigation tree, breadcrumbs akan otomatis ter-generate oleh `buildBreadcrumbTrail()`. Entry di `breadcrumbConfig` hanya diperlukan sebagai fallback.

### 8.4 Permission Code

Tambahkan permission code di `src/providers/permission-provider.tsx`:

```typescript
const DEFAULT_PERMISSIONS = new Set([
  // ... existing permissions
  "finance.master.currency.view",
  "finance.master.currency.create",
  "finance.master.currency.update",
  "finance.master.currency.delete",
])
```

**Catatan**: Permission code mengikuti pola: `{module}.{category}.{resource}.{action}`

### 8.5 Menggunakan Permission di Component

```typescript
import { usePermission } from "@/lib/hooks"

function CurrencyTable() {
  const { hasPermission } = usePermission()

  return (
    <div>
      {hasPermission("finance.master.currency.create") && (
        <Button>Add Currency</Button>
      )}
    </div>
  )
}
```

---

## Langkah 9: Metadata & Loading Skeleton

### 9.1 Export Metadata (WAJIB untuk setiap page)

Setiap `page.tsx` harus export metadata agar browser tab menampilkan judul yang tepat.

**Untuk Server Component (tanpa hooks/interactivity)**:

```typescript
// page.tsx
import { generateMetadata as genMeta } from "@/config/site"

export const metadata = genMeta("Currency")
// Browser tab: "Currency | Go Apps"

export default function CurrencyPage() {
  return <div>...</div>
}
```

**Untuk Client Component (menggunakan hooks)**:

Pisahkan menjadi server wrapper + client component:

```
app/(dashboard)/finance/master/currency/
├── page.tsx                  # Server: metadata + render client
├── currency-page-client.tsx  # "use client": actual content
└── loading.tsx               # Loading skeleton
```

```typescript
// page.tsx (server)
import { generateMetadata as genMeta } from "@/config/site"
import CurrencyPageClient from "./currency-page-client"

export const metadata = genMeta("Currency")

export default function CurrencyPage() {
  return <CurrencyPageClient />
}
```

```typescript
// currency-page-client.tsx
"use client"

import { Suspense } from "react"
// ... imports

function CurrencyPageContent() {
  const [filters, setFilters] = useUrlState({ ... })
  // ... hooks, handlers
  return <div>...</div>
}

export default function CurrencyPageClient() {
  return (
    <Suspense fallback={<CurrencyPageSkeleton />}>
      <CurrencyPageContent />
    </Suspense>
  )
}
```

### 9.2 Loading Skeleton (WAJIB untuk setiap page)

Tambahkan `loading.tsx` di samping `page.tsx`:

```typescript
// loading.tsx
import { TableSkeleton } from "@/components/loading"   // Untuk halaman list/table
// atau
import { DashboardSkeleton } from "@/components/loading" // Untuk halaman dashboard
// atau
import { PageSkeleton } from "@/components/loading"     // Generic

export default function CurrencyLoading() {
    return <TableSkeleton />
}
```

Available skeleton components:
- `DashboardSkeleton` — Untuk dashboard (stats cards + charts + activity)
- `TableSkeleton` — Untuk halaman list/table
- `PageSkeleton` — Generic page skeleton
- `CardSkeleton`, `ChartSkeleton` — Component individual

---

## Testing

### Jalankan Tests

```bash
# Run semua tests
npm test

# Run tests dengan watch mode
npm run test

# Run tests sekali (CI)
npm run test:run

# Run dengan coverage
npm run test:coverage
```

### Test Files

```
src/__tests__/
├── hooks/
│   └── use-uom.test.ts      # Test untuk CRUD hooks
├── components/
│   └── uom-filters.test.tsx # Test untuk components
├── lib/
│   └── api-proxy.test.ts    # Test untuk proxy utilities
├── mocks/
│   ├── handlers.ts          # MSW mock handlers
│   └── server.ts            # MSW server setup
├── setup.ts                 # Test setup (jest-dom, MSW)
└── utils.tsx                # Test utilities (render with providers)
```

---

## Troubleshooting

### Error: "Module not found"

**Penyebab**: Path alias `@/` tidak resolve

**Solusi**: Pastikan `tsconfig.json` ada path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: "fromJSON is not a function"

**Penyebab**: Proto types belum di-generate atau import salah

**Solusi**:
1. Run `npm run generate:proto`
2. Check import menggunakan Parser: `ListUOMsResponseParser.fromJSON()`

### Error: "Zod resolver type mismatch"

**Penyebab**: Zod v4 compatibility issue

**Solusi**: Cast resolver:
```typescript
resolver: zodResolver(schema) as never
```

### Data tidak muncul

**Penyebab**: Backend tidak running atau URL salah

**Solusi**:
1. Check backend running: `curl http://localhost:8080/health`
2. Check environment variable: `FINANCE_SERVICE_URL`
3. Check browser network tab untuk error response

### Toast tidak muncul

**Penyebab**: Toaster component belum ditambahkan

**Solusi**: Tambahkan di layout/providers:
```tsx
import { Toaster } from "sonner"

export function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  )
}
```

### Search input lambat / keystroke hilang

**Penyebab**: Menggunakan `<Input>` langsung dengan URL state

**Solusi**: Gunakan `DebouncedSearchInput`:
```tsx
// ❌ SALAH
<Input
  value={filters.search}
  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
/>

// ✅ BENAR
import { DebouncedSearchInput } from "@/components/common"

<DebouncedSearchInput
  value={filters.search || ""}
  onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
  debounceMs={300}
/>
```

### Error "useSearchParams() should be wrapped in a suspense boundary"

**Penyebab**: `useUrlState` menggunakan `useSearchParams` yang membutuhkan Suspense

**Solusi**: Wrap page content dengan Suspense:
```tsx
function PageContent() {
  const [filters, setFilters] = useUrlState({ ... })
  return <div>...</div>
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PageContent />
    </Suspense>
  )
}
```

### Filter hilang saat reload halaman

**Penyebab**: Menggunakan `useState` untuk filter state

**Solusi**: Gunakan `useUrlState` agar filter tersimpan di URL:
```tsx
// ❌ SALAH - Filter hilang saat reload
const [filters, setFilters] = useState({ page: 1, search: "" })

// ✅ BENAR - Filter tersimpan di URL
const [filters, setFilters] = useUrlState({
  defaultValues: { page: 1, search: "" }
})
```

---

## Quick Reference

### Generator Script

Untuk generate boilerplate fitur baru:

```bash
npm run generate:feature -- --service=finance --entity=currency --name="Currency"
```

### File Checklist

**Types & API**:
- [ ] `src/types/generated/{service}/v1/{entity}.ts` (auto-generated)
- [ ] `src/types/{service}/{entity}.ts`
- [ ] `src/app/api/v1/{service}/{entity}s/route.ts`
- [ ] `src/app/api/v1/{service}/{entity}s/[{entity}Id]/route.ts`
- [ ] `src/app/api/v1/{service}/{entity}s/export/route.ts`
- [ ] `src/app/api/v1/{service}/{entity}s/import/route.ts`
- [ ] `src/app/api/v1/{service}/{entity}s/template/route.ts`

**Hooks**:
- [ ] `src/hooks/{service}/use-{entity}.ts`

**Components**:
- [ ] `src/components/{service}/{entity}/index.ts`
- [ ] `src/components/{service}/{entity}/{entity}-table.tsx`
- [ ] `src/components/{service}/{entity}/{entity}-form-dialog.tsx`
- [ ] `src/components/{service}/{entity}/{entity}-delete-dialog.tsx`
- [ ] `src/components/{service}/{entity}/{entity}-filters.tsx`
- [ ] `src/components/{service}/{entity}/{entity}-pagination.tsx`

**Page** (pilih pattern sesuai kebutuhan):
- [ ] `src/app/(dashboard)/{module}/{category}/{entity}/page.tsx` — Server wrapper + metadata
- [ ] `src/app/(dashboard)/{module}/{category}/{entity}/{entity}-page-client.tsx` — Client content (jika pakai hooks)
- [ ] `src/app/(dashboard)/{module}/{category}/{entity}/loading.tsx` — Loading skeleton

**Navigation & Permission**:
- [ ] Update `src/config/navigation.ts` — tambahkan menu item + breadcrumb config
- [ ] Update `src/providers/permission-provider.tsx` — tambahkan permission codes

---

## Kesimpulan

Dengan mengikuti panduan ini, Anda dapat membuat fitur CRUD lengkap dengan:

1. **Type Safety** - Proto-generated types mencegah runtime errors
2. **Consistent Patterns** - Factory pattern untuk hooks dan proxy
3. **Proper Caching** - TanStack Query dengan hierarchical keys
4. **Good UX** - Toast notifications, loading skeletons, error handling
5. **Testable Code** - MSW untuk mock API dalam tests
6. **Dynamic Metadata** - Setiap halaman punya judul di browser tab
7. **3-Level Navigation** - Sidebar mendukung Module > Category > Page
8. **Permission-Ready** - Permission codes siap untuk IAM integration
9. **Auto Breadcrumbs** - Breadcrumb otomatis dari navigation tree

Total waktu untuk membuat fitur baru (setelah familiar): ~2-4 jam.

---

## Referensi Terkait

- [Development Guide](./DEVELOPMENT.md) - Panduan development umum
- [IAM Menu & Permission Spec](./IAM_MENU_PERMISSION_SPEC.md) - Spesifikasi untuk backend IAM service
- [Proto Generation](./PROTO_GENERATION.md) - Cara generate TypeScript types dari proto
- [Component Library](./COMPONENT_LIBRARY.md) - Dokumentasi shared components
