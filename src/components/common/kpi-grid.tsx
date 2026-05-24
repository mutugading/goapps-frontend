import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface KpiGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

const colsClass: Record<NonNullable<KpiGridProps["cols"]>, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

// KpiGrid is the responsive wrapper for a row of KpiCards.
export function KpiGrid({ children, cols = 4, className }: KpiGridProps) {
  return <div className={cn("grid gap-4", colsClass[cols], className)}>{children}</div>;
}
