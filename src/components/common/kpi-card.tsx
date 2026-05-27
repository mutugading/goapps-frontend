import { ReactNode } from "react";
import Link from "next/link";
import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/ui/typography";

export type KpiVariant = "default" | "success" | "warning" | "destructive";

export interface KpiDelta {
  value: number;
  label?: string;
  trend?: "up" | "down" | "flat";
}

export interface KpiCardProps {
  title: string;
  value: ReactNode;
  delta?: KpiDelta;
  icon?: LucideIcon;
  variant?: KpiVariant;
  loading?: boolean;
  href?: string;
  className?: string;
}

const accentByVariant: Record<KpiVariant, string> = {
  default: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  destructive: "text-destructive",
};

const iconBgByVariant: Record<KpiVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
};

// KpiCard renders a compact stat tile: title + icon header, large numeric
// value, and an optional delta line. Wraps in a Link when href is provided.
export function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  variant = "default",
  loading = false,
  href,
  className,
}: KpiCardProps) {
  const body = (
    <Card
      className={cn(
        "gap-2 transition-shadow",
        href && "cursor-pointer hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1">
        <CardTitle className={typography.cardTitle}>{title}</CardTitle>
        {Icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-md", iconBgByVariant[variant])}>
            <Icon className="size-4" />
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <>
            <div className={cn(typography.metric, accentByVariant[variant])}>{value}</div>
            {delta && (
              <div className={cn(typography.metricDelta, "mt-1 flex items-center gap-1")}>
                {delta.trend === "up" && <TrendingUp className="size-3 text-emerald-500" />}
                {delta.trend === "down" && <TrendingDown className="size-3 text-destructive" />}
                <span>
                  {delta.value > 0 ? "+" : ""}
                  {delta.value}
                </span>
                {delta.label && <span>{delta.label}</span>}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  }
  return body;
}
