// User Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Enums
export {
    ActiveFilter,
    activeFilterFromJSON,
    activeFilterToJSON,
} from "@/types/generated/iam/v1/user"

// Entity and Request/Response types (as type-only exports)
export type {
    User,
    UserDetail,
    UserWithDetail,
    SectionInfo,
    CreateUserRequest,
    CreateUserResponse,
    GetUserRequest,
    GetUserResponse,
    GetUserDetailRequest,
    GetUserDetailResponse,
    UpdateUserRequest,
    UpdateUserResponse,
    UpdateUserDetailRequest,
    UpdateUserDetailResponse,
    DeleteUserRequest,
    DeleteUserResponse,
    ListUsersRequest,
    ListUsersResponse,
    AssignUserRolesRequest,
    AssignUserRolesResponse,
    RemoveUserRolesRequest,
    RemoveUserRolesResponse,
    GetUserRolesAndPermissionsRequest,
    GetUserRolesAndPermissionsResponse,
    UserAccessInfo,
    RoleWithPermissions,
    Permission,
} from "@/types/generated/iam/v1/user"

// Message functions for parsing (named exports as Parsers)
export {
    User as UserParser,
    UserDetail as UserDetailParser,
    UserWithDetail as UserWithDetailParser,
    CreateUserResponse as CreateUserResponseParser,
    GetUserResponse as GetUserResponseParser,
    GetUserDetailResponse as GetUserDetailResponseParser,
    UpdateUserResponse as UpdateUserResponseParser,
    UpdateUserDetailResponse as UpdateUserDetailResponseParser,
    DeleteUserResponse as DeleteUserResponseParser,
    ListUsersResponse as ListUsersResponseParser,
    AssignUserRolesResponse as AssignUserRolesResponseParser,
    RemoveUserRolesResponse as RemoveUserRolesResponseParser,
    GetUserRolesAndPermissionsResponse as GetUserRolesAndPermissionsResponseParser,
} from "@/types/generated/iam/v1/user"

// Re-export common types from proto
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

/**
 * Active filter display labels for UI
 */
export const ACTIVE_FILTER_LABELS: Record<ActiveFilter, string> = {
    [ActiveFilter.ACTIVE_FILTER_UNSPECIFIED]: "All Status",
    [ActiveFilter.ACTIVE_FILTER_ACTIVE]: "Active",
    [ActiveFilter.ACTIVE_FILTER_INACTIVE]: "Inactive",
    [ActiveFilter.UNRECOGNIZED]: "Unknown",
}

/**
 * Active filter options for select inputs
 */
export const ACTIVE_FILTER_OPTIONS = [
    { value: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED, label: "All Status" },
    { value: ActiveFilter.ACTIVE_FILTER_ACTIVE, label: "Active" },
    { value: ActiveFilter.ACTIVE_FILTER_INACTIVE, label: "Inactive" },
]

// ============================================================================
// Simplified Params Types for Hooks
// ============================================================================

/**
 * Simplified list params for hooks
 */
export interface ListUsersParams {
    page?: number
    pageSize?: number
    search?: string
    activeFilter?: ActiveFilter
    roleId?: string
    sectionId?: string
    departmentId?: string
    divisionId?: string
    companyId?: string
    sortBy?: string
    sortOrder?: string
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Form data for user create form
 */
export interface UserCreateFormData {
    username: string
    email: string
    password: string
    employeeCode: string
    fullName: string
    firstName: string
    lastName: string
    phone?: string
    position?: string
    dateOfBirth?: string
    address?: string
    roleIds: string[]
}

/**
 * Form data for user edit form (credentials)
 */
export interface UserEditFormData {
    username?: string
    email?: string
    isActive?: boolean
}

/**
 * Default form values for creating a new user
 */
export const DEFAULT_USER_FORM_VALUES: UserCreateFormData = {
    username: "",
    email: "",
    password: "",
    employeeCode: "",
    fullName: "",
    firstName: "",
    lastName: "",
    phone: "",
    position: "",
    dateOfBirth: "",
    address: "",
    roleIds: [],
}
