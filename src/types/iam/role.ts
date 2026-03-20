// Role & Permission Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Entity types
export type {
    Role,
    CreateRoleRequest,
    CreateRoleResponse,
    GetRoleRequest,
    GetRoleResponse,
    UpdateRoleRequest,
    UpdateRoleResponse,
    DeleteRoleRequest,
    DeleteRoleResponse,
    ListRolesRequest,
    ListRolesResponse,
    AssignRolePermissionsRequest,
    AssignRolePermissionsResponse,
    RemoveRolePermissionsRequest,
    RemoveRolePermissionsResponse,
    GetRolePermissionsRequest,
    GetRolePermissionsResponse,
    PermissionDetail,
    CreatePermissionRequest,
    CreatePermissionResponse,
    GetPermissionRequest,
    GetPermissionResponse,
    UpdatePermissionRequest,
    UpdatePermissionResponse,
    DeletePermissionRequest,
    DeletePermissionResponse,
    ListPermissionsRequest,
    ListPermissionsResponse,
    GetPermissionsByServiceRequest,
    GetPermissionsByServiceResponse,
    ServicePermissions,
    ModulePermissions,
} from "@/types/generated/iam/v1/role"

// Message functions for parsing
export {
    Role as RoleParser,
    CreateRoleResponse as CreateRoleResponseParser,
    GetRoleResponse as GetRoleResponseParser,
    UpdateRoleResponse as UpdateRoleResponseParser,
    DeleteRoleResponse as DeleteRoleResponseParser,
    ListRolesResponse as ListRolesResponseParser,
    AssignRolePermissionsResponse as AssignRolePermissionsResponseParser,
    RemoveRolePermissionsResponse as RemoveRolePermissionsResponseParser,
    GetRolePermissionsResponse as GetRolePermissionsResponseParser,
    PermissionDetail as PermissionDetailParser,
    CreatePermissionResponse as CreatePermissionResponseParser,
    GetPermissionResponse as GetPermissionResponseParser,
    UpdatePermissionResponse as UpdatePermissionResponseParser,
    DeletePermissionResponse as DeletePermissionResponseParser,
    ListPermissionsResponse as ListPermissionsResponseParser,
    GetPermissionsByServiceResponse as GetPermissionsByServiceResponseParser,
} from "@/types/generated/iam/v1/role"

// Re-export ActiveFilter from user.ts (used by role/permission list)
export { ActiveFilter } from "@/types/generated/iam/v1/user"

// Re-export common types
export type {
    BaseResponse,
    PaginationResponse,
    AuditInfo,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Import for local use
// ============================================================================

import { ActiveFilter } from "@/types/generated/iam/v1/user"

// ============================================================================
// UI Display Labels
// ============================================================================

export const ACTIVE_FILTER_OPTIONS = [
    { value: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED, label: "All Status" },
    { value: ActiveFilter.ACTIVE_FILTER_ACTIVE, label: "Active" },
    { value: ActiveFilter.ACTIVE_FILTER_INACTIVE, label: "Inactive" },
]

export const ACTION_TYPE_OPTIONS = [
    { value: "", label: "All Actions" },
    { value: "view", label: "View" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "export", label: "Export" },
    { value: "import", label: "Import" },
]

// ============================================================================
// Simplified Params Types for Hooks
// ============================================================================

export interface ListRolesParams {
    page?: number
    pageSize?: number
    search?: string
    activeFilter?: ActiveFilter
    isSystem?: boolean
    sortBy?: string
    sortOrder?: string
}

export interface ListPermissionsParams {
    page?: number
    pageSize?: number
    search?: string
    activeFilter?: ActiveFilter
    serviceName?: string
    moduleName?: string
    actionType?: string
    sortBy?: string
    sortOrder?: string
}

// ============================================================================
// Form Types
// ============================================================================

export interface RoleFormData {
    roleCode: string
    roleName: string
    description: string
    permissionIds: string[]
}

export const DEFAULT_ROLE_FORM_VALUES: RoleFormData = {
    roleCode: "",
    roleName: "",
    description: "",
    permissionIds: [],
}
