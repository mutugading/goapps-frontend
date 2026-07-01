import type { PermissionDetail } from "@/types/iam/role"

// GLOBAL_GROUP_TITLE labels the bucket for permissions with no owning page.
export const GLOBAL_GROUP_TITLE = "Global / Ungrouped"

// PermissionGroup is one page's worth of permissions (or the global bucket).
export interface PermissionGroup {
    menuId: string | null
    menuTitle: string
    permissions: PermissionDetail[]
}

/**
 * groupPermissionsByMenu groups a flat permission list by owning page (menuId).
 * Named pages come first, preserving first-seen order (the backend already returns
 * rows ordered by menu.sort_order); the global/ungrouped bucket is always last.
 * Permissions with an empty menuId (or missing menuTitle) fall into the global bucket.
 */
export function groupPermissionsByMenu(permissions: PermissionDetail[]): PermissionGroup[] {
    const named = new Map<string, PermissionGroup>()
    const global: PermissionGroup = { menuId: null, menuTitle: GLOBAL_GROUP_TITLE, permissions: [] }

    for (const perm of permissions) {
        const menuId = perm.menuId?.trim() ?? ""
        if (menuId === "") {
            global.permissions.push(perm)
            continue
        }
        let group = named.get(menuId)
        if (!group) {
            group = { menuId, menuTitle: perm.menuTitle?.trim() || menuId, permissions: [] }
            named.set(menuId, group)
        }
        group.permissions.push(perm)
    }

    const groups = Array.from(named.values())
    if (global.permissions.length > 0) {
        groups.push(global)
    }
    return groups
}
