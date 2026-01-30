import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/common/page-header"
import { AreaChart } from "@/components/charts/area-chart"
import { PieChart } from "@/components/charts/pie-chart"
import {
    DollarSign,
    Users,
    ShoppingCart,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import dashboardData from "@/data/dashboard.json"

export default function DashboardPage() {
    const { stats, monthlyData, moduleStats, recentActivities } = dashboardData

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle="Overview of your enterprise metrics and activities"
            />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+12.5%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.activeUsers.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+8.2%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">-4.3%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completionRate}%</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+2.1%</span> from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue and profit trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AreaChart
                            data={monthlyData}
                            xAxisKey="month"
                            series={[
                                { key: "revenue", label: "Revenue", color: "#3b82f6" },
                                { key: "profit", label: "Profit", color: "#22c55e" },
                            ]}
                            className="h-[300px]"
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Module Distribution</CardTitle>
                        <CardDescription>Activity distribution by module</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PieChart data={moduleStats} className="h-[300px]" />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions across all modules</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-sm font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            by {activity.user}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary">{activity.module}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {activity.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
