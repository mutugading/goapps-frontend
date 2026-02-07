# IAM Service: Dynamic Menu & Role-Based Permission Spec

> **Audience**: Backend developers implementing the IAM gRPC service.
> **Purpose**: Provide the contract the frontend expects so the sidebar, breadcrumbs, and route guards work dynamically.

---

## 1. Overview

The frontend currently uses a **hardcoded** navigation tree and permission set (see `src/config/navigation.ts` and `src/providers/permission-provider.tsx`). When the IAM service is ready, the frontend will:

1. Fetch the **user's menu tree** (filtered by their role permissions) on login/session init.
2. Fetch the **user's permission codes** for fine-grained UI checks (button visibility, etc.).
3. Replace the hardcoded data — no structural changes needed in the frontend.

---

## 2. Menu Structure (3-Level Hierarchy)

```
Level 1: Module        (e.g., Finance, IT, HR)
Level 2: Category      (e.g., Master, Transaction) — no page, grouping only
Level 3: Page/Leaf     (e.g., Unit of Measure, Costing Process) — has URL
```

### Current Frontend Navigation Tree

```
Overview (group)
└── Dashboard                    → /dashboard

Modules (group)
├── Finance                      → /finance/dashboard
│   ├── Dashboard                → /finance/dashboard
│   ├── Master (category, no URL)
│   │   ├── Unit of Measure      → /finance/master/uom
│   │   └── Parameters           → /finance/master/parameters
│   └── Transaction (category, no URL)
│       └── Costing Process      → /finance/transaction/costing-process
├── IT                           → /it/dashboard
│   └── Dashboard                → /it/dashboard
├── HR                           → /hr/dashboard
│   └── Dashboard                → /hr/dashboard
├── Export Import                → /exsim/dashboard
│   └── Dashboard                → /exsim/dashboard
└── CI                           → /ci/dashboard
    └── Dashboard                → /ci/dashboard

Settings (group)
└── Settings                     → /settings
    ├── Users                    → /settings/users       (hidden)
    ├── Roles                    → /settings/roles       (hidden)
    └── Menus                    → /settings/menus       (hidden)
```

---

## 3. Proto Definitions (Recommended)

### 3.1 Menu Entity

```protobuf
syntax = "proto3";
package iam.v1;

message MenuItem {
  string menu_id = 1;             // UUID
  string parent_id = 2;           // UUID of parent, empty for root
  string title = 3;               // Display title (e.g., "Unit of Measure")
  string icon_name = 4;           // Lucide icon name (e.g., "DollarSign", "Database", "Receipt")
  string url = 5;                 // Route path (empty for category items)
  string permission_code = 6;     // Required permission (e.g., "finance.master.uom.view")
  int32 sort_order = 7;           // Display order within parent
  bool is_visible = 8;            // Whether menu is shown
  bool is_active = 9;             // Soft delete flag
  MenuLevel level = 10;           // 1=Module, 2=Category, 3=Page
  string group_title = 11;        // Sidebar group (e.g., "Overview", "Modules", "Settings")
  repeated MenuItem children = 12; // Nested children (populated by backend)
}

enum MenuLevel {
  MENU_LEVEL_UNSPECIFIED = 0;
  MENU_LEVEL_MODULE = 1;          // Level 1: Finance, IT, HR
  MENU_LEVEL_CATEGORY = 2;        // Level 2: Master, Transaction (no URL)
  MENU_LEVEL_PAGE = 3;            // Level 3: Unit of Measure, Parameters (has URL)
}
```

### 3.2 Permission Entity

```protobuf
message Permission {
  string permission_id = 1;       // UUID
  string code = 2;                // Dot-notation code (e.g., "finance.master.uom.view")
  string name = 3;                // Human-readable name
  string description = 4;
  string module = 5;              // Module grouping (e.g., "finance")
  PermissionAction action = 6;    // view, create, update, delete, export, import
  bool is_active = 7;
}

enum PermissionAction {
  PERMISSION_ACTION_UNSPECIFIED = 0;
  PERMISSION_ACTION_VIEW = 1;
  PERMISSION_ACTION_CREATE = 2;
  PERMISSION_ACTION_UPDATE = 3;
  PERMISSION_ACTION_DELETE = 4;
  PERMISSION_ACTION_EXPORT = 5;
  PERMISSION_ACTION_IMPORT = 6;
}
```

### 3.3 Role Entity

```protobuf
message Role {
  string role_id = 1;             // UUID
  string role_code = 2;           // e.g., "ADMIN", "FINANCE_MANAGER"
  string role_name = 3;           // e.g., "Administrator", "Finance Manager"
  string description = 4;
  bool is_active = 5;
  repeated string permission_ids = 6;  // Assigned permissions
  common.v1.AuditInfo audit_info = 7;
}
```

### 3.4 Service RPCs

```protobuf
service IAMService {
  // === Menu Management (admin) ===
  rpc ListMenus(ListMenusRequest) returns (ListMenusResponse);
  rpc CreateMenu(CreateMenuRequest) returns (CreateMenuResponse);
  rpc UpdateMenu(UpdateMenuRequest) returns (UpdateMenuResponse);
  rpc DeleteMenu(DeleteMenuRequest) returns (DeleteMenuResponse);

  // === Role Management (admin) ===
  rpc ListRoles(ListRolesRequest) returns (ListRolesResponse);
  rpc CreateRole(CreateRoleRequest) returns (CreateRoleResponse);
  rpc UpdateRole(UpdateRoleRequest) returns (UpdateRoleResponse);
  rpc DeleteRole(DeleteRoleRequest) returns (DeleteRoleResponse);
  rpc AssignPermissions(AssignPermissionsRequest) returns (AssignPermissionsResponse);

  // === Permission Management (admin) ===
  rpc ListPermissions(ListPermissionsRequest) returns (ListPermissionsResponse);

  // === User Session (called by frontend on login) ===
  rpc GetUserMenu(GetUserMenuRequest) returns (GetUserMenuResponse);
  rpc GetUserPermissions(GetUserPermissionsRequest) returns (GetUserPermissionsResponse);
}
```

---

## 4. Key API Endpoints (Frontend Needs)

### 4.1 `GetUserMenu` — Sidebar Data

**When called**: On app load / session init.

**Request**:
```protobuf
message GetUserMenuRequest {
  string user_id = 1;  // Or resolved from auth token
}
```

**Response**:
```protobuf
message GetUserMenuResponse {
  common.v1.BaseResponse base = 1;
  repeated MenuGroup groups = 2;
}

message MenuGroup {
  string title = 1;               // "Overview", "Modules", "Settings"
  repeated MenuItem items = 2;    // Already filtered by user's role permissions
}
```

**Important backend behavior**:
- Only return menus where the user has the corresponding `permission_code`
- Return the full tree (3 levels nested via `children`)
- If a **category** (level 2) has no visible children after filtering, **exclude it**
- Sort by `sort_order` within each level
- Resolve `icon_name` string — frontend maps it to Lucide icon component

**Example response**:
```json
{
  "base": { "isSuccess": true },
  "groups": [
    {
      "title": "Modules",
      "items": [
        {
          "menuId": "uuid-1",
          "title": "Finance",
          "iconName": "DollarSign",
          "url": "/finance/dashboard",
          "permissionCode": "finance.view",
          "sortOrder": 1,
          "level": "MENU_LEVEL_MODULE",
          "children": [
            {
              "menuId": "uuid-2",
              "title": "Dashboard",
              "url": "/finance/dashboard",
              "permissionCode": "finance.dashboard.view",
              "sortOrder": 1,
              "level": "MENU_LEVEL_PAGE"
            },
            {
              "menuId": "uuid-3",
              "title": "Master",
              "iconName": "Database",
              "url": "",
              "permissionCode": "finance.master.view",
              "sortOrder": 2,
              "level": "MENU_LEVEL_CATEGORY",
              "children": [
                {
                  "menuId": "uuid-4",
                  "title": "Unit of Measure",
                  "url": "/finance/master/uom",
                  "permissionCode": "finance.master.uom.view",
                  "sortOrder": 1,
                  "level": "MENU_LEVEL_PAGE"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 4.2 `GetUserPermissions` — Permission Codes

**When called**: On app load / session init (alongside GetUserMenu).

**Response**:
```protobuf
message GetUserPermissionsResponse {
  common.v1.BaseResponse base = 1;
  repeated string permissions = 2;  // ["finance.view", "finance.master.uom.view", ...]
}
```

**Frontend usage**: The `PermissionProvider` stores these in a `Set<string>` and exposes `hasPermission(code)` to all components.

---

## 5. Permission Code Convention

### Naming Pattern

```
{module}.{category?}.{resource?}.{action}
```

### Examples

| Code | Meaning |
|------|---------|
| `dashboard.view` | View main dashboard |
| `finance.view` | Access finance module |
| `finance.dashboard.view` | View finance dashboard |
| `finance.master.view` | See Master category in sidebar |
| `finance.master.uom.view` | View UOM page |
| `finance.master.uom.create` | Create new UOM |
| `finance.master.uom.update` | Edit existing UOM |
| `finance.master.uom.delete` | Delete UOM |
| `finance.master.uom.export` | Export UOM data |
| `finance.master.uom.import` | Import UOM data |
| `finance.transaction.view` | See Transaction category |
| `finance.transaction.costing-process.view` | View Costing Process page |
| `settings.view` | Access settings |
| `settings.roles.view` | View roles management |
| `settings.roles.create` | Create new role |

### Hierarchy Rules

- To see a **page** (level 3), user needs: module `.view` + category `.view` + page `.view`
- To see a **category** (level 2), user needs at least one visible child page
- CRUD permissions (`create`, `update`, `delete`) are checked inline by the frontend (button visibility, form enablement)

---

## 6. Database Schema (Recommended)

```sql
-- Menus (sidebar structure)
CREATE TABLE menus (
    menu_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id     UUID REFERENCES menus(menu_id),
    title         VARCHAR(100) NOT NULL,
    icon_name     VARCHAR(50),          -- Lucide icon name
    url           VARCHAR(200),         -- NULL for categories
    permission_code VARCHAR(100) NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    level         SMALLINT NOT NULL,    -- 1=Module, 2=Category, 3=Page
    group_title   VARCHAR(50) NOT NULL, -- "Overview", "Modules", "Settings"
    is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permissions (granular actions)
CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(100) UNIQUE NOT NULL,  -- "finance.master.uom.view"
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    module        VARCHAR(50) NOT NULL,           -- "finance", "it", "hr"
    action        VARCHAR(20) NOT NULL,           -- "view", "create", etc.
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
    role_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code     VARCHAR(50) UNIQUE NOT NULL,
    role_name     VARCHAR(100) NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Role-Permission mapping (many-to-many)
CREATE TABLE role_permissions (
    role_id       UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User-Role mapping (many-to-many)
CREATE TABLE user_roles (
    user_id       UUID NOT NULL,        -- References users table
    role_id       UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Indexes
CREATE INDEX idx_menus_parent ON menus(parent_id);
CREATE INDEX idx_menus_group ON menus(group_title, sort_order);
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_code ON permissions(code);
```

### Seed Data (Initial Menus)

```sql
-- Group: Overview
INSERT INTO menus (menu_id, parent_id, title, icon_name, url, permission_code, sort_order, level, group_title)
VALUES
  ('m-dashboard', NULL, 'Dashboard', 'LayoutDashboard', '/dashboard', 'dashboard.view', 1, 1, 'Overview');

-- Group: Modules > Finance
INSERT INTO menus VALUES
  ('m-finance', NULL, 'Finance', 'DollarSign', '/finance/dashboard', 'finance.view', 1, 1, 'Modules'),
  ('m-fin-dash', 'm-finance', 'Dashboard', NULL, '/finance/dashboard', 'finance.dashboard.view', 1, 3, 'Modules'),
  ('m-fin-master', 'm-finance', 'Master', 'Database', NULL, 'finance.master.view', 2, 2, 'Modules'),
  ('m-fin-master-uom', 'm-fin-master', 'Unit of Measure', NULL, '/finance/master/uom', 'finance.master.uom.view', 1, 3, 'Modules'),
  ('m-fin-master-params', 'm-fin-master', 'Parameters', NULL, '/finance/master/parameters', 'finance.master.parameters.view', 2, 3, 'Modules'),
  ('m-fin-tx', 'm-finance', 'Transaction', 'Receipt', NULL, 'finance.transaction.view', 3, 2, 'Modules'),
  ('m-fin-tx-costing', 'm-fin-tx', 'Costing Process', NULL, '/finance/transaction/costing-process', 'finance.transaction.costing-process.view', 1, 3, 'Modules');

-- ... similar for IT, HR, ExSim, CI, Settings
```

---

## 7. Frontend Integration Plan

When the IAM service is ready, the frontend changes are minimal:

### 7.1 `src/providers/permission-provider.tsx`

```typescript
// Replace hardcoded permissions with API call
async function fetchUserPermissions(): Promise<Set<string>> {
  const response = await apiClient.get<GetUserPermissionsResponse>(
    "/api/v1/iam/user/permissions"
  )
  return new Set(response.permissions)
}
```

### 7.2 New: `src/hooks/iam/use-user-menu.ts`

```typescript
export function useUserMenu() {
  return useQuery({
    queryKey: ["iam", "user-menu"],
    queryFn: async () => {
      const response = await apiClient.get<GetUserMenuResponse>(
        "/api/v1/iam/user/menu"
      )
      return response.groups // NavGroup[] format
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}
```

### 7.3 `src/components/app-sidebar.tsx`

```typescript
// Replace static navigation with dynamic
const { data: navGroups } = useUserMenu()
// navGroups replaces getVisibleNavigation()
```

### 7.4 Icon Resolution

The frontend has an icon resolver map:

```typescript
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, DollarSign, Database, Receipt,
  MonitorDot, Users, Ship, TrendingUp, Settings,
  // Add new icons as menus grow
}

function resolveIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? LayoutDashboard
}
```

The backend should store icon names as strings matching Lucide React icon export names.

---

## 8. Default Roles (Seed)

| Role Code | Name | Permissions |
|-----------|------|-------------|
| `SUPER_ADMIN` | Super Administrator | All permissions |
| `FINANCE_ADMIN` | Finance Admin | `finance.*` (all finance permissions) |
| `FINANCE_VIEWER` | Finance Viewer | `finance.*.view` + `finance.*.export` |
| `IT_ADMIN` | IT Admin | `it.*` |
| `HR_ADMIN` | HR Admin | `hr.*` |
| `VIEWER` | Read-Only User | `*.view` only |

---

## 9. Checklist for Backend Implementation

- [ ] Proto definitions for Menu, Permission, Role entities
- [ ] CRUD gRPC services for Menu, Permission, Role
- [ ] `GetUserMenu` RPC — returns filtered, nested menu tree
- [ ] `GetUserPermissions` RPC — returns flat permission code list
- [ ] Database schema + seed data for initial menus and permissions
- [ ] Menu tree query with recursive CTE (for nested children)
- [ ] Role-permission assignment APIs
- [ ] Integration tests for menu filtering by role
- [ ] gRPC-gateway HTTP mappings for all endpoints
