import { usePermissionContext } from "@/providers/permission-provider"
import type { PermissionContextValue } from "@/providers/permission-provider"

export function usePermission(): PermissionContextValue {
    return usePermissionContext()
}
