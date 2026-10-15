import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {delta !== undefined && (
        <p className={cn("mt-1 text-xs", delta >= 0 ? "text-success" : "text-destructive")}>
          {delta >= 0 ? "+" : ""}
          {delta}% so với tháng trước
        </p>
      )}
    </div>
  );
}
