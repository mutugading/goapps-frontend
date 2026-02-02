import {
    LayoutDashboard,
    DollarSign,
    Settings,
    MonitorDot,
    Users,
    Ship,
    TrendingUp,
    type LucideIcon,
} from "lucide-react"

// Navigation types supporting up to 3 levels
export interface NavSubItem {
    title: string
    url: string
    isActive?: boolean
}

export interface NavSubMenu {
    title: string
    url: string
    isActive?: boolean
    items?: NavSubItem[]
}

export interface NavItem {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: NavSubMenu[]
}

export interface NavGroup {
    title: string
    items: NavItem[]
}

// User data for sidebar
export const userData = {
    name: "John Doe",
    email: "john.doe@company.com",
    // avatar: undefined - uses initials fallback
}

// Navigation structure with 3 levels support
export const navigation: NavGroup[] = [
    {
        title: "Overview",
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutDashboard,
                isActive: true,
            },
        ],
    },
    {
        title: "Modules",
        items: [
            {
                title: "Finance",
                url: "/finance/dashboard",
                icon: DollarSign,
                isActive: true,
                items: [
                    {
                        title: "Dashboard",
                        url: "/finance/dashboard",
                    },
                    {
                        title: "Costing",
                        url: "/finance/costing/uom",
                        isActive: true,
                        items: [
                            {
                                title: "Unit of Measure",
                                url: "/finance/costing/uom",
                            },
                            {
                                title: "Parameters",
                                url: "/finance/costing/parameters",
                            },
                            {
                                title: "Cost Centers",
                                url: "/finance/costing/cost-centers",
                            },
                        ],
                    },
                    {
                        title: "Budgeting",
                        url: "/finance/budgeting",
                        items: [
                            {
                                title: "Annual Budget",
                                url: "/finance/budgeting/annual",
                            },
                            {
                                title: "Monthly Forecast",
                                url: "/finance/budgeting/forecast",
                            },
                        ],
                    },
                    {
                        title: "Reports",
                        url: "/finance/reports",
                    },
                ],
            },
            {
                title: "IT",
                url: "/it/dashboard",
                icon: MonitorDot,
                items: [
                    {
                        title: "Dashboard",
                        url: "/it/dashboard",
                    },
                    {
                        title: "Assets",
                        url: "/it/assets",
                    },
                    {
                        title: "Tickets",
                        url: "/it/tickets",
                    },
                ],
            },
            {
                title: "HR",
                url: "/hr/dashboard",
                icon: Users,
                items: [
                    {
                        title: "Dashboard",
                        url: "/hr/dashboard",
                    },
                    {
                        title: "Employees",
                        url: "/hr/employees",
                    },
                    {
                        title: "Leave Management",
                        url: "/hr/leave",
                    },
                ],
            },
            {
                title: "Export Import",
                url: "/exsim/dashboard",
                icon: Ship,
                items: [
                    {
                        title: "Dashboard",
                        url: "/exsim/dashboard",
                    },
                    {
                        title: "Shipments",
                        url: "/exsim/shipments",
                    },
                ],
            },
            {
                title: "CI",
                url: "/ci/dashboard",
                icon: TrendingUp,
                items: [
                    {
                        title: "Dashboard",
                        url: "/ci/dashboard",
                    },
                    {
                        title: "Projects",
                        url: "/ci/projects",
                    },
                ],
            },
        ],
    },
    {
        title: "Settings",
        items: [
            {
                title: "Settings",
                url: "/settings",
                icon: Settings,
                items: [
                    {
                        title: "General",
                        url: "/settings/general",
                    },
                    {
                        title: "Users",
                        url: "/settings/users",
                    },
                    {
                        title: "Roles",
                        url: "/settings/roles",
                    },
                ],
            },
        ],
    },
]
