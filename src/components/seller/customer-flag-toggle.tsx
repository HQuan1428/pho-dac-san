"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Loader2, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";
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
import { toggleCustomerFlagAction } from "@/server/seller/orders";

interface CustomerFlagToggleProps {
  phone: string;
  flag: {
    id: string;
    reason: string | null;
    createdAt: Date;
  } | null;
}

export function CustomerFlagToggle({ phone, flag }: CustomerFlagToggleProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(
    flag?.reason || "Bom hàng, gọi điện không nghe máy hoặc từ chối nhận hàng không có lý do"
  );
  const [loading, setLoading] = useState(false);

  const handleToggle = async (remove: boolean) => {
    setLoading(true);
    try {
      const res = await toggleCustomerFlagAction({
        phone,
        reason: remove ? undefined : reason.trim(),
        remove,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          remove
            ? "Đã gỡ cảnh báo bom hàng cho số điện thoại này"
            : "Đã đánh dấu số điện thoại này là bom hàng"
        );
        setOpen(false);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (flag) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <ShieldAlert className="size-4 shrink-0" />
            <span>Cảnh báo: Khách hàng bom hàng</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={loading}
            onClick={() => handleToggle(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {loading ? <Loader2 className="size-3 animate-spin mr-1" /> : <Check className="size-3 mr-1" />}
            Gỡ đánh dấu
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {flag.reason ? `Lý do ghi nhận: "${flag.reason}"` : "Số điện thoại đã bị đánh dấu bom hàng."}
        </p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
          />
        }
      >
        <Flag className="size-3.5" />
        Đánh dấu bom hàng
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đánh dấu số điện thoại {phone} là bom hàng?</DialogTitle>
          <DialogDescription>
            Sau khi đánh dấu, biểu tượng cảnh báo bom hàng sẽ xuất hiện trên mọi đơn hàng mới từ số
            điện thoại này để bạn cân nhắc trước khi chuẩn bị hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label htmlFor="flag-reason" className="text-xs font-semibold text-foreground">
            Lý do đánh dấu
          </label>
          <Textarea
            id="flag-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ghi rõ lý do bom hàng..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => handleToggle(false)}
          >
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Xác nhận đánh dấu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
