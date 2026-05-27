"use client"

import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "./status-badge"
import type { CostProductRequest } from "@/types/finance/cost-product-request"

interface Props {
  items: CostProductRequest[]
  isLoading?: boolean
  onOpen: (r: CostProductRequest) => void
}

export function RequestTable({ items, isLoading, onOpen }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Request #</TableHead>
            <TableHead className="w-28">Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-44">Customer</TableHead>
            <TableHead className="w-24">Class</TableHead>
            <TableHead className="w-20">Urgency</TableHead>
            <TableHead className="w-44">Status</TableHead>
            <TableHead className="w-16 text-right">Open</TableHead>
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
                No requests yet.
              </TableCell>
            </TableRow>
          )}
          {items.map((r) => (
            <TableRow key={r.requestId} className="hover:bg-muted/50 cursor-pointer" onClick={() => onOpen(r)}>
              <TableCell className="font-mono text-xs">{r.requestNo}</TableCell>
              <TableCell className="font-mono text-xs">{r.requestTypeCode ?? `#${r.requestTypeId}`}</TableCell>
              <TableCell>
                <div className="font-medium">{r.title}</div>
                {r.description && (
                  <div className="text-xs text-muted-foreground truncate max-w-[40ch]">{r.description}</div>
                )}
              </TableCell>
              <TableCell>{r.customerName}</TableCell>
              <TableCell>
                <span className="text-xs">{r.productClassification}</span>
                {r.verifiedClassification && r.verifiedClassification !== r.productClassification && (
                  <span className="ml-1 text-xs text-orange-600">→ {r.verifiedClassification}</span>
                )}
              </TableCell>
              <TableCell className="text-xs capitalize">{r.urgencyLevel}</TableCell>
              <TableCell>
                <StatusBadge status={r.status} substatus={r.closedSubstatus} />
              </TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" aria-label="Open">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
