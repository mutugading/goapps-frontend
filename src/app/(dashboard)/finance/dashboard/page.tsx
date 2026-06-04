import { generateMetadata as genMeta } from "@/config/site"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { KpiCard } from "@/components/common/kpi-card"
import { KpiGrid } from "@/components/common/kpi-grid"
import { BarChart } from "@/components/charts/bar-chart"
import {
    DollarSign,
    TrendingUp,
    Ruler,
    Calculator,
    Plus,
    Construction,
} from "lucide-react"
import Link from "next/link"

export const metadata = genMeta("Finance Dashboard")

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
                    <Link href="/finance/master/uom">
                        <Plus className="mr-2 h-4 w-4" />
                        New UOM
                    </Link>
                </Button>
            </PageHeader>

            <div className="space-y-6">
                {/* Under Development Banner */}
                <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <Construction className="size-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-800 dark:text-amber-300">
                        Under Development — Sample Data Only
                    </AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-400">
                        <p>This page is still under development. All figures and charts displayed are <strong>sample data</strong> and do not reflect actual system data.</p>
                    </AlertDescription>
                </Alert>

                {/* Stats Cards */}
                <KpiGrid cols={4}>
                    <KpiCard
                        title="Total Budget"
                        value="$1,250,000"
                        icon={DollarSign}
                        delta={{ value: 0, label: "FY 2026", trend: "flat" }}
                    />
                    <KpiCard
                        title="Used Budget"
                        value="$875,000"
                        icon={TrendingUp}
                        variant="warning"
                        delta={{ value: 70, label: "% utilized", trend: "up" }}
                    />
                    <KpiCard
                        title="Units of Measure"
                        value={45}
                        icon={Ruler}
                        href="/finance/master/uom"
                    />
                    <KpiCard
                        title="Parameters"
                        value={128}
                        icon={Calculator}
                        href="/finance/master/parameters"
                    />
                </KpiGrid>

                {/* Costing Chart */}
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle>Costing Breakdown</CardTitle>
                        <CardDescription>Monthly cost distribution by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <BarChart
                                data={costingData}
                                xAxisKey="month"
                                series={[
                                    { key: "materials", label: "Materials", color: "#3b82f6" },
                                    { key: "labor", label: "Labor", color: "#22c55e" },
                                    { key: "overhead", label: "Overhead", color: "#f59e0b" },
                                ]}
                                className="h-full"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions + Recent Updates */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/finance/master/uom">Manage UOMs</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/finance/master/parameters">Manage Parameters</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/finance/product-requests">Product Requests</Link>
                            </Button>
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
        </div>
    )
}
