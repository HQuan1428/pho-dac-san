import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  count,
  compact,
  className,
}: {
  value: number;
  count?: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs tabular-nums", className)} aria-label={`${value} trên 5 sao`}>
      {compact ? (
        <>
          <Star className="size-3.5 fill-foreground text-foreground" />
          <span className="font-medium">{value.toFixed(1)}</span>
        </>
      ) : (
        [1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn("size-4", i <= Math.round(value) ? "fill-warning text-warning" : "text-border")} />
        ))
      )}
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}
