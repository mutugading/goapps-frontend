import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { Construction } from "lucide-react"

export default function CIDashboardPage() {
    return (
        <div>
            <PageHeader
                title="Continuous Improvement"
                subtitle="Track CI initiatives and process improvements"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5" />
                        Coming Soon
                    </CardTitle>
                    <CardDescription>
                        The CI module is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This module will include project tracking, improvement metrics,
                        and CI initiative management.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
