import { generateMetadata as genMeta } from "@/config/site"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = genMeta("Parameters")
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import costingData from "@/data/costing.json"

export default function ParametersPage() {
    return (
        <div>
            <PageHeader
                title="Parameters"
                subtitle="Manage system parameters for costing calculations"
            >
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Parameter
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>Parameters List</CardTitle>
                    <CardDescription>
                        All configured parameters ({costingData.parameters.length} total)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Data Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costingData.parameters.map((param) => (
                                <TableRow key={param.id}>
                                    <TableCell className="font-mono text-sm">{param.code}</TableCell>
                                    <TableCell>{param.name}</TableCell>
                                    <TableCell className="font-mono">{param.value}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{param.dataType}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{param.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={param.status === "active" ? "default" : "secondary"}
                                        >
                                            {param.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
