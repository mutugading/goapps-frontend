"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLinkedRequests } from "@/hooks/finance/use-duplicate-route"

interface Props {
  headId: number
}

export function LinkedRequestsPopover({ headId }: Props) {
  const { data } = useLinkedRequests(headId)
  const rows = data ?? []
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          🔗 {rows.length} linked {rows.length === 1 ? "request" : "requests"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        {rows.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">No requests linked yet.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.requestId} className="py-2">
                <Link
                  href={`/finance/product-requests/${r.requestId}`}
                  className="text-sm hover:underline"
                >
                  <div className="font-mono">{r.requestNo}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.productTop2 || "—"} · <Badge variant="outline">{r.status}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
