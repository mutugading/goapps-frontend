import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  baseBadgeVariant,
  getStatusDisplay,
  semanticBadgeClasses,
  type StatusType,
} from "@/lib/ui/status-colors";

export interface StatusBadgeProps {
  status: string | null | undefined;
  type?: StatusType;
  size?: "sm" | "md";
  className?: string;
}

// StatusBadge renders a consistent status pill from the central registry.
// success/warning variants (absent from shadcn's Badge) are applied as
// className overrides so components/ui stays untouched.
export function StatusBadge({ status, type = "generic", size = "md", className }: StatusBadgeProps) {
  const { variant, label } = getStatusDisplay(type, status);
  return (
    <Badge
      variant={baseBadgeVariant(variant)}
      className={cn(
        semanticBadgeClasses[variant],
        size === "sm" && "px-1.5 py-0 text-[10px]",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
