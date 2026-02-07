# Proto Type Generation

Guide for generating TypeScript types from Protocol Buffer definitions.

## Overview

We use `ts-proto` to generate TypeScript types from `.proto` files. The generated types include:

- Interface definitions
- Enum definitions with conversion functions
- `fromJSON()` and `toJSON()` methods for parsing
- `fromPartial()` for creating partial objects

## Directory Structure

```
goapps-shared-proto/
├── buf.yaml                # Buf module configuration
├── buf.gen.yaml            # Go backend generation config
├── buf.gen.ts.yaml         # TypeScript frontend generation config
├── buf.lock                # Dependency lock file
├── common/v1/
│   └── common.proto        # BaseResponse, PaginationResponse, etc.
├── finance/v1/
│   └── uom.proto           # UOM service definitions
└── scripts/
    ├── gen-go.sh           # Generate Go code only
    ├── gen-ts.sh           # Generate TypeScript types only
    └── gen-all.sh          # Generate both

goapps-frontend/
└── src/types/generated/
    ├── common/v1/common.ts
    ├── finance/v1/uom.ts
    ├── buf/validate/        # Validation types
    └── google/              # Google proto types
```

## Generation Commands

From the `goapps-shared-proto` directory:

```bash
# Generate TypeScript types only
./scripts/gen-ts.sh

# Generate Go backend code only
./scripts/gen-go.sh

# Generate both
./scripts/gen-all.sh
```

### What the scripts do:

1. **Update buf dependencies** (`buf dep update`)
2. **Format proto files** (`buf format -w`)
3. **Lint proto files** (`buf lint`)
4. **Generate code** using the appropriate config

## ts-proto Configuration

Configuration in `buf.gen.ts.yaml`:

```yaml
version: v2
plugins:
  - local: protoc-gen-ts_proto
    out: ../goapps-frontend/src/types/generated
    opt:
      - esModuleInterop=true
      - outputJsonMethods=true
      - useExactTypes=false
      - snakeToCamel=true
      - outputServices=generic-definitions
inputs:
  - directory: .
    paths:
      - common
      - finance
```

| Option | Description |
|--------|-------------|
| `esModuleInterop` | Enable ES module interop |
| `outputJsonMethods` | Generate `fromJSON()`/`toJSON()` methods |
| `useExactTypes` | Allow partial types |
| `snakeToCamel` | Handle both snake_case and camelCase in JSON |
| `outputServices` | Generate service definitions |

## Generated Type Structure

### Enums

```typescript
export enum UOMCategory {
  UOM_CATEGORY_UNSPECIFIED = 0,
  UOM_CATEGORY_WEIGHT = 1,
  UOM_CATEGORY_LENGTH = 2,
  UOM_CATEGORY_VOLUME = 3,
  UOM_CATEGORY_QUANTITY = 4,
  UNRECOGNIZED = -1,
}

// Conversion functions
export function uOMCategoryFromJSON(object: any): UOMCategory
export function uOMCategoryToJSON(object: UOMCategory): string
```

### Interfaces

```typescript
export interface UOM {
  uomId: string;
  uomCode: string;
  uomName: string;
  uomCategory: UOMCategory;
  description: string;
  isActive: boolean;
  audit?: AuditInfo | undefined;
}
```

### MessageFns

```typescript
export const UOM: MessageFns<UOM> = {
  // Parse JSON (handles both camelCase and snake_case)
  fromJSON(object: any): UOM {
    return {
      uomId: isSet(object.uomId)
        ? globalThis.String(object.uomId)
        : isSet(object.uom_id)
        ? globalThis.String(object.uom_id)
        : "",
      // ... other fields
    };
  },

  // Convert to JSON
  toJSON(message: UOM): unknown { ... },

  // Create from partial
  fromPartial<I extends Exact<DeepPartial<UOM>, I>>(object: I): UOM { ... },
};
```

## Using Generated Types

### Import Types and Parsers

```typescript
// Import types (type-only)
import type { UOM, CreateUOMRequest } from "@/types/generated/finance/v1/uom"

// Import parsers (value import)
import {
  UOM as UOMParser,
  ListUOMsResponse as ListUOMsResponseParser,
} from "@/types/generated/finance/v1/uom"

// Import enums (value import for runtime use)
import { UOMCategory } from "@/types/generated/finance/v1/uom"
```

### Parse API Response

```typescript
const rawResponse = await fetch("/api/v1/finance/uoms")
const json = await rawResponse.json()

// Parse with proto-generated fromJSON
const response = ListUOMsResponseParser.fromJSON(json)

// response.base.isSuccess is boolean (properly parsed)
// response.data is UOM[] (properly typed)
// response.pagination.totalItems is number
```

### Handle Enums

```typescript
// Enums are numeric in proto
const category = UOMCategory.UOM_CATEGORY_WEIGHT // 1

// Convert for display
const label = UOM_CATEGORY_LABELS[category] // "Weight"

// Parse from JSON (string or number both work)
const parsed = uOMCategoryFromJSON("UOM_CATEGORY_WEIGHT") // 1
const parsed2 = uOMCategoryFromJSON(1) // 1

// Convert to string for API
const str = uOMCategoryToJSON(category) // "UOM_CATEGORY_WEIGHT"
```

## Re-export Pattern

Create a feature-specific types file that re-exports and adds UI helpers:

```typescript
// /src/types/finance/uom.ts

// Re-export types
export type { UOM, CreateUOMRequest } from "@/types/generated/finance/v1/uom"

// Re-export parsers with aliased names
export {
  UOM as UOMParser,
  CreateUOMResponse as CreateUOMResponseParser,
} from "@/types/generated/finance/v1/uom"

// Re-export enums
export { UOMCategory, uOMCategoryFromJSON } from "@/types/generated/finance/v1/uom"

// Add UI helpers
export const UOM_CATEGORY_LABELS: Record<UOMCategory, string> = {
  [UOMCategory.UOM_CATEGORY_UNSPECIFIED]: "All",
  [UOMCategory.UOM_CATEGORY_WEIGHT]: "Weight",
  // ...
}
```

## Dependencies

The generated files require `@bufbuild/protobuf`:

```bash
npm install @bufbuild/protobuf
```

## Troubleshooting

### Types Not Found

```bash
# Regenerate types
cd ~/goapps/goapps-shared-proto
./scripts/gen-ts.sh
```

### Plugin Not Found

Ensure `ts-proto` is installed in the frontend:

```bash
cd ~/goapps/goapps-frontend
npm install ts-proto
```

### camelCase vs snake_case

The `fromJSON()` methods handle both automatically:

```typescript
// Both work
const uom1 = UOMParser.fromJSON({ uomId: "123" })
const uom2 = UOMParser.fromJSON({ uom_id: "123" })
// Both return { uomId: "123", ... }
```

### Enum Values

Proto enums are numeric at runtime:

```typescript
// This is wrong
if (uom.uomCategory === "UOM_CATEGORY_WEIGHT") // false

// This is correct
if (uom.uomCategory === UOMCategory.UOM_CATEGORY_WEIGHT) // true
if (uom.uomCategory === 1) // true
```

## When to Regenerate

Regenerate proto types when:
- Proto files change (new fields, types, services)
- ts-proto version is updated
- New proto modules are added

Always run `./scripts/gen-ts.sh` after pulling changes to `goapps-shared-proto`.
