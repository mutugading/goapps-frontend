import { generateMetadata as genMeta } from "@/config/site"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { Construction } from "lucide-react"

export const metadata = genMeta("Costing Process")

export default function CostingProcessPage() {
    return (
        <div>
            <PageHeader
                title="Costing Process"
                subtitle="Manage costing process transactions"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5" />
                        Coming Soon
                    </CardTitle>
                    <CardDescription>
                        The Costing Process page is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page will include costing process management,
                        cost calculation workflows, and transaction tracking.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
