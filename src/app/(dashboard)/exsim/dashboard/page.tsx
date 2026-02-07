import { generateMetadata as genMeta } from "@/config/site"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { Construction } from "lucide-react"

export const metadata = genMeta("Export Import")

export default function ExsimDashboardPage() {
    return (
        <div>
            <PageHeader
                title="Export Import"
                subtitle="Manage shipments and trade operations"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5" />
                        Coming Soon
                    </CardTitle>
                    <CardDescription>
                        The Export Import module is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This module will include shipment tracking, customs documentation,
                        and trade analytics.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
