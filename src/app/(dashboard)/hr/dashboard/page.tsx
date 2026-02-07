import { generateMetadata as genMeta } from "@/config/site"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { Construction } from "lucide-react"

export const metadata = genMeta("Human Resources")

export default function HRDashboardPage() {
    return (
        <div>
            <PageHeader
                title="Human Resources"
                subtitle="Manage employees and HR operations"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5" />
                        Coming Soon
                    </CardTitle>
                    <CardDescription>
                        The HR module is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This module will include employee management, leave tracking,
                        and HR analytics.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
