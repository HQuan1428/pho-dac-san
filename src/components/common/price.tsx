import { cn } from "@/lib/utils";

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function formatVnd(amount: number) {
  return vnd.format(amount);
}

export function Price({
  amount,
  original,
  className,
}: {
  amount: number;
  original?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-semibold tabular-nums">{formatVnd(amount)}</span>
      {original && original > amount && (
        <span className="text-sm text-muted-foreground line-through">{formatVnd(original)}</span>
      )}
    </span>
  );
}
