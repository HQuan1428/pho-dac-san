"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Ban, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  approveShop,
  rejectShop,
  suspendShop,
  reactivateShop,
  changeShopPlan,
} from "./actions";
import type { ShopPlan, ShopStatus } from "@prisma/client";

export function ShopActionButtons({
  shopId,
  shopName,
  status,
  currentPlan,
}: {
  shopId: string;
  shopName: string;
  status: ShopStatus;
  currentPlan: ShopPlan;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      try {
        const res = await approveShop(shopId);
        if (res.success) {
          toast.success(`Đã phê duyệt gian hàng "${shopName}"`);
        } else {
          toast.error(res.error || "Không thể duyệt gian hàng");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Không thể duyệt gian hàng");
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    startTransition(async () => {
      try {
        const res = await rejectShop(shopId, rejectReason);
        if (res.success) {
          toast.success(`Đã từ chối gian hàng "${shopName}"`);
          setRejectOpen(false);
          setRejectReason("");
        } else {
          toast.error(res.error || "Không thể từ chối gian hàng");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Lỗi xử lý từ chối");
      }
    });
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) {
      toast.error("Vui lòng nhập lý do tạm đình chỉ");
      return;
    }
    startTransition(async () => {
      try {
        const res = await suspendShop(shopId, suspendReason);
        if (res.success) {
          toast.success(`Đã đình chỉ gian hàng "${shopName}"`);
          setSuspendOpen(false);
          setSuspendReason("");
        } else {
          toast.error(res.error || "Không thể đình chỉ gian hàng");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Lỗi xử lý đình chỉ");
      }
    });
  };

  const handleReactivate = () => {
    startTransition(async () => {
      try {
        const res = await reactivateShop(shopId);
        if (res.success) {
          toast.success(`Đã kích hoạt lại gian hàng "${shopName}"`);
        } else {
          toast.error(res.error || "Lỗi kích hoạt lại");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Lỗi kích hoạt lại");
      }
    });
  };

  const handleChangePlan = (plan: ShopPlan) => {
    startTransition(async () => {
      try {
        await changeShopPlan(shopId, plan);
        toast.success(`Đã đổi gói thành ${plan} cho "${shopName}"`);
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Lỗi đổi gói dịch vụ");
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {status === "PENDING" && (
        <>
          <Button
            size="xs"
            onClick={handleApprove}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <Check data-icon="inline-start" className="size-3.5" />
            Duyệt
          </Button>
          <Button
            size="xs"
            variant="destructive"
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
          >
            <X data-icon="inline-start" className="size-3.5" />
            Từ chối
          </Button>
        </>
      )}

      {status === "ACTIVE" && (
        <Button
          size="xs"
          variant="outline"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => setSuspendOpen(true)}
          disabled={isPending}
        >
          <Ban data-icon="inline-start" className="size-3.5" />
          Đình chỉ
        </Button>
      )}

      {(status === "SUSPENDED" || status === "REJECTED") && (
        <Button
          size="xs"
          variant="outline"
          onClick={handleReactivate}
          disabled={isPending}
        >
          <RefreshCw data-icon="inline-start" className="size-3.5" />
          Kích hoạt lại
        </Button>
      )}

      {/* Plan changer dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="xs" variant="ghost" disabled={isPending} title="Đổi gói">
              <Layers className="size-3.5 text-muted-foreground" />
              <span className="sr-only">Đổi gói</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">Đổi gói dịch vụ</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(["FREE", "PRO", "BUSINESS"] as ShopPlan[]).map((p) => (
            <DropdownMenuItem
              key={p}
              onClick={() => handleChangePlan(p)}
              disabled={p === currentPlan}
              className="text-xs flex items-center justify-between"
            >
              <span>Gói {p}</span>
              {p === currentPlan && <Check className="size-3 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối hồ sơ gian hàng</DialogTitle>
            <DialogDescription>
              Gian hàng &ldquo;{shopName}&rdquo; sẽ bị từ chối. Thông báo và email kèm lý do sẽ được gửi tới chủ shop.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Lý do từ chối <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Ví dụ: Thiếu giấy tờ chứng minh xuất xứ hoặc địa chỉ chưa rõ ràng..."
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRejectOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạm đình chỉ gian hàng</DialogTitle>
            <DialogDescription>
              Gian hàng &ldquo;{shopName}&rdquo; sẽ bị ẩn khỏi chợ. Sản phẩm sẽ không thể được đặt mua cho đến khi được kích hoạt lại.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Lý do tạm đình chỉ <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Ví dụ: Có nhiều phản ánh sản phẩm không đúng chất lượng cam kết..."
              rows={4}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSuspendOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={isPending || !suspendReason.trim()}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận đình chỉ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
