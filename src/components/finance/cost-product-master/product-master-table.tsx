"use client"

import Link from "next/link"
import { Edit, Link2, Power } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ProductTypeName } from "@/components/common/product-type-name"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { CostProductMaster } from "@/types/finance/cost-product-master"

interface Props {
  items: CostProductMaster[]
  isLoading?: boolean
  onEdit: (p: CostProductMaster) => void
  onLinkErp: (p: CostProductMaster) => void
  onDeactivate: (p: CostProductMaster) => void
}

export function ProductMasterTable({ items, isLoading, onEdit, onLinkErp, onDeactivate }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">Product code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-32">Type</TableHead>
            <TableHead className="w-24">Shade</TableHead>
            <TableHead className="w-20">Grade</TableHead>
            <TableHead className="w-40">ERP linkage</TableHead>
            <TableHead className="w-24">Status</TableHead>
            <TableHead className="w-44 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}
          {!isLoading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No products yet.
              </TableCell>
            </TableRow>
          )}
          {items.map((p) => (
            <TableRow key={p.productSysId}>
              <TableCell className="font-mono text-xs">
                <Link
                  href={`/finance/product-master/${p.productSysId}`}
                  className="hover:underline text-primary"
                >
                  {p.productCode}
                </Link>
              </TableCell>
              <TableCell>{p.productName}</TableCell>
              <TableCell className="text-xs">
                {p.productTypeCode ? (
                  <span className="font-mono">{p.productTypeCode}</span>
                ) : (
                  <ProductTypeName id={p.productTypeId} />
                )}
              </TableCell>
              <TableCell>{p.shadeCode || "—"}</TableCell>
              <TableCell>{p.gradeCode}</TableCell>
              <TableCell className="text-xs">
                {p.erpItemCode ? (
                  <div className="space-y-0.5">
                    <div className="font-mono">{p.erpItemCode}</div>
                    {(p.erpGradeCode1 || p.erpGradeCode2) && (
                      <div className="text-muted-foreground">
                        {[p.erpGradeCode1, p.erpGradeCode2].filter(Boolean).join(" / ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not linked</span>
                )}
              </TableCell>
              <TableCell>
                {p.isActive ? (
                  <Badge variant="secondary">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="icon" variant="ghost" onClick={() => onEdit(p)} disabled={!p.isActive} title="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onLinkErp(p)} disabled={!p.isActive} title="ERP linkage">
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeactivate(p)}
                  disabled={!p.isActive}
                  title="Deactivate"
                >
                  <Power className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
