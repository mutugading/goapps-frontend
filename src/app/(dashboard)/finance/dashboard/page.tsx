import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { BarChart } from "@/components/charts/bar-chart"
import {
    DollarSign,
    TrendingUp,
    Ruler,
    Calculator,
    Plus,
} from "lucide-react"
import Link from "next/link"

const costingData = [
    { month: "Jan", materials: 45000, labor: 32000, overhead: 18000 },
    { month: "Feb", materials: 52000, labor: 35000, overhead: 19000 },
    { month: "Mar", materials: 48000, labor: 33000, overhead: 20000 },
    { month: "Apr", materials: 61000, labor: 38000, overhead: 22000 },
    { month: "May", materials: 55000, labor: 36000, overhead: 21000 },
    { month: "Jun", materials: 67000, labor: 42000, overhead: 24000 },
]

export default function FinanceDashboardPage() {
    return (
        <div>
            <PageHeader
                title="Finance Dashboard"
                subtitle="Overview of finance module metrics and costing data"
            >
                <Button asChild>
                    <Link href="/finance/costing/uom">
                        <Plus className="mr-2 h-4 w-4" />
                        New UOM
                    </Link>
                </Button>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,250,000</div>
                        <p className="text-xs text-muted-foreground">FY 2026</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Used Budget</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$875,000</div>
                        <p className="text-xs text-muted-foreground">70% utilized</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Units of Measure</CardTitle>
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <Button variant="link" className="px-0 h-auto" asChild>
                            <Link href="/finance/costing/uom">View all →</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Parameters</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <Button variant="link" className="px-0 h-auto" asChild>
                            <Link href="/finance/costing/parameters">View all →</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Costing Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Costing Breakdown</CardTitle>
                    <CardDescription>Monthly cost distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <BarChart
                        data={costingData}
                        xAxisKey="month"
                        series={[
                            { key: "materials", label: "Materials", color: "#3b82f6" },
                            { key: "labor", label: "Labor", color: "#22c55e" },
                            { key: "overhead", label: "Overhead", color: "#f59e0b" },
                        ]}
                        className="h-[350px]"
                    />
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 flex-wrap">
                        <Button variant="outline" asChild>
                            <Link href="/finance/costing/uom">Manage UOMs</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/finance/costing/parameters">Manage Parameters</Link>
                        </Button>
                        <Button variant="outline">Generate Report</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Updates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• 3 new UOMs added this week</p>
                            <p>• Parameter TAX_RATE updated</p>
                            <p>• Monthly budget report generated</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
