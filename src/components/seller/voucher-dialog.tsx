"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/common/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createVoucherAction,
  updateVoucherAction,
  type VoucherFormValues,
} from "@/server/seller/vouchers";

interface VoucherDialogProps {
  voucher?: {
    id: string;
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    minOrder: number;
    maxDiscount: number | null;
    startsAt: Date;
    endsAt: Date;
    usageLimit: number | null;
    active: boolean;
  };
  trigger?: React.ReactNode;
}

export function VoucherDialog({ voucher, trigger }: VoucherDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(voucher);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 30);

  const [code, setCode] = useState(voucher?.code || "");
  const [type, setType] = useState<"PERCENT" | "FIXED">(voucher?.type || "PERCENT");
  const [value, setValue] = useState(voucher?.value ?? 10);
  const [minOrder, setMinOrder] = useState(voucher?.minOrder ?? 0);
  const [maxDiscount, setMaxDiscount] = useState<number | null>(voucher?.maxDiscount ?? null);
  const [startsAt, setStartsAt] = useState(
    voucher ? formatDateTimeLocal(voucher.startsAt) : formatDateTimeLocal(new Date())
  );
  const [endsAt, setEndsAt] = useState(
    voucher ? formatDateTimeLocal(voucher.endsAt) : formatDateTimeLocal(tomorrow)
  );
  const [usageLimit, setUsageLimit] = useState<number | null>(voucher?.usageLimit ?? null);
  const [active, setActive] = useState(voucher?.active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const upperCode = code.trim().toUpperCase();
    if (!upperCode) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (type === "PERCENT" && (value <= 0 || value > 100)) {
      toast.error("Giảm theo % phải từ 1 đến 100%");
      return;
    }

    if (type === "FIXED" && value <= 0) {
      toast.error("Số tiền giảm phải lớn hơn 0");
      return;
    }

    if (new Date(endsAt) <= new Date(startsAt)) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setLoading(true);

    const payload: VoucherFormValues = {
      code: upperCode,
      type,
      value,
      minOrder,
      maxDiscount: type === "PERCENT" ? maxDiscount : null,
      startsAt,
      endsAt,
      usageLimit,
      active,
    };

    try {
      if (isEdit && voucher) {
        const res = await updateVoucherAction(voucher.id, payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Cập nhật mã giảm giá thành công");
          setOpen(false);
          router.refresh();
        }
      } else {
        const res = await createVoucherAction(payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Tạo mã giảm giá thành công");
          setOpen(false);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : isEdit ? (
            <Button variant="ghost" size="icon-xs" aria-label="Sửa voucher">
              <Edit className="size-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Tạo mã giảm giá
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? `Sửa mã "${voucher?.code}"` : "Tạo mã giảm giá mới"}</DialogTitle>
            <DialogDescription>
              Mã giảm giá chỉ áp dụng cho các đơn hàng đặt từ gian hàng của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <FormField id="voucher-code" label="Mã giảm giá *" hint="Chỉ gồm chữ hoa, số (VD: DACSAN20, CHAOMOI)">
              <Input
                id="voucher-code"
                required
                placeholder="VD: GIAM20K"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="voucher-type" label="Loại giảm giá *">
                <Select
                  items={{ PERCENT: "Theo phần trăm (%)", FIXED: "Số tiền cố định (đ)" }}
                  value={type}
                  onValueChange={(val) => val && setType(val as "PERCENT" | "FIXED")}
                >
                  <SelectTrigger id="voucher-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Theo phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED">Số tiền cố định (đ)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                id="voucher-value"
                label={type === "PERCENT" ? "Mức giảm (%) *" : "Số tiền giảm (đ) *"}
              >
                <Input
                  id="voucher-value"
                  type="number"
                  required
                  min={1}
                  max={type === "PERCENT" ? 100 : undefined}
                  step={type === "PERCENT" ? 1 : 1000}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value) || 0)}
                  className="font-mono"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="voucher-min" label="Đơn tối thiểu (đ)">
                <Input
                  id="voucher-min"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="0"
                  value={minOrder === 0 ? "" : minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value) || 0)}
                  className="font-mono"
                />
              </FormField>

              {type === "PERCENT" ? (
                <FormField id="voucher-max" label="Giảm tối đa (đ)" hint="Để trống nếu không giới hạn">
                  <Input
                    id="voucher-max"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Không giới hạn"
                    value={maxDiscount ?? ""}
                    onChange={(e) =>
                      setMaxDiscount(e.target.value ? Number(e.target.value) : null)
                    }
                    className="font-mono"
                  />
                </FormField>
              ) : (
                <div />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="voucher-start" label="Bắt đầu từ *">
                <Input
                  id="voucher-start"
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="font-mono text-xs"
                />
              </FormField>

              <FormField id="voucher-end" label="Kết thúc vào *">
                <Input
                  id="voucher-end"
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="font-mono text-xs"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <FormField
                id="voucher-limit"
                label="Lượt dùng tối đa"
                hint="Để trống nếu không giới hạn"
              >
                <Input
                  id="voucher-limit"
                  type="number"
                  min={1}
                  placeholder="Không giới hạn"
                  value={usageLimit ?? ""}
                  onChange={(e) =>
                    setUsageLimit(e.target.value ? Number(e.target.value) : null)
                  }
                  className="font-mono"
                />
              </FormField>

              <div className="flex items-center gap-2 pb-2">
                <Switch id="voucher-active" checked={active} onCheckedChange={setActive} />
                <Label htmlFor="voucher-active" className="cursor-pointer text-xs">
                  {active ? "Đang kích hoạt" : "Tạm ngưng"}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Tạo voucher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
