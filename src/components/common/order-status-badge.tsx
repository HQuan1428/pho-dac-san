import { CheckCircle2, CircleDot, PackageCheck, Truck, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus = "NEW" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

// Single source for order status label, icon and tone (badges, tabs, filters).
export const ORDER_STATUS: Record<OrderStatus, { label: string; icon: LucideIcon; className: string }> = {
  NEW: { label: "Mới", icon: CircleDot, className: "bg-info/10 text-info" },
  CONFIRMED: { label: "Đã xác nhận", icon: CheckCircle2, className: "bg-primary/10 text-primary" },
  SHIPPING: { label: "Đang giao", icon: Truck, className: "bg-warning/20 text-warning-foreground dark:text-warning" },
  COMPLETED: { label: "Hoàn thành", icon: PackageCheck, className: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "Đã hủy", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, icon: Icon, className } = ORDER_STATUS[status];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium", className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
