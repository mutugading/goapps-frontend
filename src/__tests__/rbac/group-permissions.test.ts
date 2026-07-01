import { describe, it, expect } from "vitest"

import { groupPermissionsByMenu, GLOBAL_GROUP_TITLE } from "@/lib/rbac/group-permissions"
import type { PermissionDetail } from "@/types/iam/role"

function perm(overrides: Partial<PermissionDetail>): PermissionDetail {
    return {
        permissionId: overrides.permissionId ?? "id",
        permissionCode: overrides.permissionCode ?? "svc.mod.ent.view",
        permissionName: overrides.permissionName ?? "Name",
        description: overrides.description ?? "desc",
        serviceName: overrides.serviceName ?? "svc",
        moduleName: overrides.moduleName ?? "mod",
        actionType: overrides.actionType ?? "view",
        isActive: overrides.isActive ?? true,
        roleCount: overrides.roleCount ?? 0,
        menuId: overrides.menuId ?? "",
        menuTitle: overrides.menuTitle ?? "",
    } as PermissionDetail
}

describe("groupPermissionsByMenu", () => {
    it("groups by menuId and puts the global bucket last", () => {
        const perms = [
            perm({ permissionCode: "finance.master.uom.view", menuId: "m1", menuTitle: "UOM" }),
            perm({ permissionCode: "finance.master.uom.create", menuId: "m1", menuTitle: "UOM" }),
            perm({ permissionCode: "dashboard.view", menuId: "" }),
            perm({ permissionCode: "iam.rbac.role.view", menuId: "m2", menuTitle: "Roles" }),
        ]

        const groups = groupPermissionsByMenu(perms)

        expect(groups).toHaveLength(3)
        expect(groups[0]).toMatchObject({ menuId: "m1", menuTitle: "UOM" })
        expect(groups[0].permissions).toHaveLength(2)
        expect(groups[1]).toMatchObject({ menuId: "m2", menuTitle: "Roles" })
        // Global bucket is always last.
        expect(groups[2]).toMatchObject({ menuId: null, menuTitle: GLOBAL_GROUP_TITLE })
        expect(groups[2].permissions).toHaveLength(1)
    })

    it("preserves first-seen order of named pages", () => {
        const perms = [
            perm({ menuId: "b", menuTitle: "B" }),
            perm({ menuId: "a", menuTitle: "A" }),
        ]
        const groups = groupPermissionsByMenu(perms)
        expect(groups.map((g) => g.menuId)).toEqual(["b", "a"])
    })

    it("omits the global bucket when every permission has a page", () => {
        const groups = groupPermissionsByMenu([perm({ menuId: "m1", menuTitle: "UOM" })])
        expect(groups).toHaveLength(1)
        expect(groups.every((g) => g.menuId !== null)).toBe(true)
    })

    it("treats whitespace-only menuId as global", () => {
        const groups = groupPermissionsByMenu([perm({ menuId: "   ", menuTitle: "" })])
        expect(groups).toHaveLength(1)
        expect(groups[0].menuId).toBeNull()
    })

    it("falls back to menuId as title when menuTitle is missing", () => {
        const groups = groupPermissionsByMenu([perm({ menuId: "m9", menuTitle: "" })])
        expect(groups[0].menuTitle).toBe("m9")
    })
})
