// GET /api/v1/iam/menus/tree - Get menu tree for sidebar

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl, getForwardHeaders } from "@/lib/api/proxy"

interface BackendMenuItem {
    menu_id: string
    menu_code: string
    menu_name: string
    icon: string | null
    route: string | null
    parent_id: string | null
    sort_order: number
    is_active: boolean
    children: BackendMenuItem[]
}

interface FrontendMenuItem {
    menuId: string
    menuCode: string
    menuName: string
    icon: string | null
    route: string | null
    parentId: string | null
    sortOrder: number
    isActive: boolean
    children: FrontendMenuItem[]
}

function transformMenuItem(item: BackendMenuItem): FrontendMenuItem {
    return {
        menuId: item.menu_id,
        menuCode: item.menu_code,
        menuName: item.menu_name,
        icon: item.icon,
        route: item.route,
        parentId: item.parent_id,
        sortOrder: item.sort_order,
        isActive: item.is_active,
        children: (item.children || []).map(transformMenuItem),
    }
}

export async function GET(request: NextRequest) {
    try {
        const backendUrl = getBackendUrl(SERVICES.IAM)
        const response = await fetch(`${backendUrl}/api/v1/iam/menus/tree`, {
            method: "GET",
            headers: getForwardHeaders(request),
        })

        const data = await response.json()

        return NextResponse.json(
            {
                base: {
                    isSuccess: data.base?.is_success ?? false,
                    statusCode: data.base?.status_code || String(response.status),
                    message: data.base?.message || "",
                    validationErrors: data.base?.validation_errors || [],
                },
                data: (data.data || []).map((item: BackendMenuItem) => transformMenuItem(item)),
            },
            { status: response.status }
        )
    } catch (error) {
        console.error("Error fetching menu tree:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch menu tree",
                    validationErrors: [],
                },
                data: [],
            },
            { status: 500 }
        )
    }
}
