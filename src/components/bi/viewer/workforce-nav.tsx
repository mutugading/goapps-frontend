"use client"

// Workforce dashboards share one sidebar menu (H034); this row links between them.

import Link from "next/link"

import { cn } from "@/lib/utils"
import { usePermission } from "@/lib/hooks/use-permission"

const WORKFORCE_TABS = [
  { code: "HR_OT_DEPT", label: "Overtime per Dept", permission: "finance.bi.workforce.view" },
  { code: "HR_OT_TREND", label: "Tren OT", permission: "finance.bi.workforce.view" },
  { code: "HR_OT_OVER_MONTH", label: "Tren Over-limit", permission: "finance.bi.workforce.view" },
  { code: "HR_OT_OVERLIMIT", label: "Kepatuhan 14 Jam", permission: "finance.bi.workforce.view" },
  { code: "HR_OT_EMPLOYEES", label: "Employee Overtime", permission: "finance.bi.workforceemployee.view" },
]

export const isWorkforceTab = (code: string) => WORKFORCE_TABS.some(t => t.code === code)

export function WorkforceNav({ code }: { code: string }) {
  const { hasPermission } = usePermission()
  const tabs = WORKFORCE_TABS.filter(t => hasPermission(t.permission))
  if (tabs.length < 2) return null

  return (
    <nav aria-label="Workforce" className="flex flex-wrap gap-1 border-b">
      {tabs.map(t => (
        <Link
          key={t.code}
          href={`/finance/bi/${t.code}`}
          aria-current={t.code === code ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            t.code === code
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
