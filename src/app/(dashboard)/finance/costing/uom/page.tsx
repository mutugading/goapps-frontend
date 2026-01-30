import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function UOMPage() {
    return (
        <div>
            <PageHeader
                title="Units of Measure"
                subtitle="Manage units of measure for costing calculations"
            >
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add UOM
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>UOM List</CardTitle>
                    <CardDescription>
                        All configured units of measure ({costingData.uoms.length} total)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costingData.uoms.map((uom) => (
                                <TableRow key={uom.id}>
                                    <TableCell className="font-medium">{uom.code}</TableCell>
                                    <TableCell>{uom.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {uom.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{uom.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={uom.status === "active" ? "default" : "secondary"}
                                        >
                                            {uom.status}
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
