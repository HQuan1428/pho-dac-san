"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Truck, Check, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { updateOrderStatusAction } from "@/server/seller/orders";

interface OrderStatusActionsProps {
  code: string;
  currentStatus: OrderStatus;
}

export function OrderStatusActions({ code, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleStatusChange = async (nextStatus: OrderStatus, reason?: string) => {
    setLoading(true);
    try {
      const res = await updateOrderStatusAction({
        code,
        nextStatus,
        cancelReason: reason,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã chuyển trạng thái đơn hàng sang: ${nextStatus}`);
        setCancelOpen(false);
        setCancelReason("");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật trạng thái thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isFinal = currentStatus === "COMPLETED" || currentStatus === "CANCELLED";

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <span className="text-sm font-medium text-foreground">Trạng thái hiện tại:</span>
        <OrderStatusBadge status={currentStatus} />
      </div>

      {!isFinal && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Chuyển tiếp trạng thái đơn hàng:</p>

          <div className="flex flex-wrap items-center gap-2">
            {currentStatus === "NEW" && (
              <Button
                size="sm"
                disabled={loading}
                onClick={() => handleStatusChange("CONFIRMED")}
                className="gap-1.5"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Xác nhận đơn hàng
              </Button>
            )}

            {currentStatus === "CONFIRMED" && (
              <Button
                size="sm"
                disabled={loading}
                onClick={() => handleStatusChange("SHIPPING")}
                className="gap-1.5"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Truck className="size-3.5" />
                )}
                Bắt đầu giao hàng
              </Button>
            )}

            {currentStatus === "SHIPPING" && (
              <Button
                size="sm"
                disabled={loading}
                onClick={() => handleStatusChange("COMPLETED")}
                className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Hoàn thành đơn hàng
              </Button>
            )}

            {/* Cancel dialog trigger */}
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" size="sm" disabled={loading} className="gap-1.5" />
                }
              >
                <XCircle className="size-3.5" />
                Hủy đơn
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hủy đơn hàng #{code}?</DialogTitle>
                  <DialogDescription>
                    Hành động này sẽ hủy đơn hàng và hoàn lại số lượng tồn kho cho các phân loại sản
                    phẩm. Khách hàng sẽ nhận được thông báo hủy đơn.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                  <label htmlFor="cancel-reason" className="text-xs font-semibold text-foreground">
                    Lý do hủy đơn (bắt buộc) *
                  </label>
                  <Textarea
                    id="cancel-reason"
                    rows={3}
                    placeholder="VD: Khách báo hủy qua điện thoại, hết hàng, hoặc địa chỉ không hỗ trợ giao..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancelOpen(false)}
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={loading || !cancelReason.trim()}
                    onClick={() => handleStatusChange("CANCELLED", cancelReason.trim())}
                  >
                    {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                    Xác nhận hủy đơn
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {isFinal && (
        <p className="text-xs text-muted-foreground italic">
          {currentStatus === "COMPLETED"
            ? "Đơn hàng đã hoàn thành, không thể thay đổi trạng thái."
            : "Đơn hàng đã bị hủy, không thể thay đổi trạng thái."}
        </p>
      )}
    </div>
  );
}
