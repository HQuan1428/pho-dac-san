"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/components/common/price";
import { VoucherDialog } from "./voucher-dialog";
import {
  toggleVoucherActiveAction,
  deleteVoucherAction,
} from "@/server/seller/vouchers";

interface VoucherTableRowProps {
  voucher: {
    id: string;
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    minOrder: number;
    maxDiscount: number | null;
    startsAt: Date;
    endsAt: Date;
    usageLimit: number | null;
    usedCount: number;
    active: boolean;
    _count: { orders: number };
  };
}

export function VoucherTableRow({ voucher }: VoucherTableRowProps) {
  const router = useRouter();
  const [active, setActive] = useState(voucher.active);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setToggling(true);
    try {
      const res = await toggleVoucherActiveAction(voucher.id, checked);
      if (res.error) {
        toast.error(res.error);
      } else {
        setActive(checked);
        toast.success(
          checked
            ? `Đã kích hoạt mã "${voucher.code}"`
            : `Đã tạm dừng mã "${voucher.code}"`
        );
      }
    } catch {
      toast.error("Không thể thay đổi trạng thái");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${voucher.code}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await deleteVoucherAction(voucher.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã xóa mã giảm giá thành công");
        router.refresh();
      }
    } catch {
      toast.error("Xóa mã thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = new Date(voucher.endsAt) < new Date();

  return (
    <TableRow>
      <TableCell>
        <span className="font-mono font-bold text-sm text-foreground bg-muted px-2 py-1 rounded">
          {voucher.code}
        </span>
      </TableCell>
      <TableCell className="text-sm font-semibold text-primary">
        {voucher.type === "PERCENT" ? `Giảm ${voucher.value}%` : `Giảm ${formatVnd(voucher.value)}`}
        {voucher.maxDiscount && (
          <span className="block text-[11px] font-normal text-muted-foreground">
            Tối đa {formatVnd(voucher.maxDiscount)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-xs">
        {voucher.minOrder > 0 ? formatVnd(voucher.minOrder) : "0 đ"}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        <div>{new Date(voucher.startsAt).toLocaleDateString("vi-VN")}</div>
        <div className={isExpired ? "text-destructive font-medium" : ""}>
          đến {new Date(voucher.endsAt).toLocaleDateString("vi-VN")}
          {isExpired && " (Hết hạn)"}
        </div>
      </TableCell>
      <TableCell className="text-center text-xs tabular-nums">
        <span className="font-semibold text-foreground">{voucher.usedCount}</span>
        <span className="text-muted-foreground"> / {voucher.usageLimit ?? "∞"}</span>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center items-center gap-1.5">
          <Switch
            disabled={toggling}
            checked={active}
            onCheckedChange={handleToggle}
            aria-label="Kích hoạt mã giảm giá"
          />
          <Badge
            variant={active ? "outline" : "secondary"}
            className="text-[10px] hidden sm:inline-flex"
          >
            {active ? "Bật" : "Tắt"}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-center p-2">
        <div className="flex items-center justify-center gap-1">
          <VoucherDialog voucher={voucher} />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={deleting}
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Xóa mã giảm giá"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
