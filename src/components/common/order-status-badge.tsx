import { cn } from "@/lib/utils";

export type OrderStatus = "NEW" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

const config: Record<OrderStatus, { label: string; className: string }> = {
  NEW: { label: "Mới", className: "bg-info/10 text-info" },
  CONFIRMED: { label: "Đã xác nhận", className: "bg-primary/10 text-primary" },
  SHIPPING: { label: "Đang giao", className: "bg-warning/20 text-warning-foreground dark:text-warning" },
  COMPLETED: { label: "Hoàn thành", className: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "Đã hủy", className: "bg-destructive/10 text-destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium before:size-1.5 before:rounded-full before:bg-current", className)}>
      {label}
    </span>
  );
}
