"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import {
  createAddressAction,
  updateAddressAction,
  type AddressActionState,
} from "./actions";

export type AddressData = {
  id: string;
  name: string;
  phone: string;
  provinceId: string;
  detail: string;
  isDefault: boolean;
};

export type ProvinceOption = {
  id: string;
  name: string;
};

export function AddressFormDialog({
  provinces,
  initialData,
  trigger,
}: {
  provinces: ProvinceOption[];
  initialData?: AddressData;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(
    initialData?.provinceId || ""
  );
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);

  const isEdit = !!initialData;

  const boundAction = isEdit
    ? updateAddressAction.bind(null, initialData.id)
    : createAddressAction;

  const [state, formAction, isPending] = useActionState<
    AddressActionState | null,
    FormData
  >(boundAction, null);

  useEffect(() => {
    if (state?.success) {
      if (state.message) toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button size="sm">
              <Plus className="size-4" />
              Thêm địa chỉ mới
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật địa chỉ nhận hàng" : "Thêm địa chỉ nhận hàng mới"}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin người nhận và địa chỉ giao hàng chi tiết
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <input type="hidden" name="provinceId" value={selectedProvince} />
          <input type="hidden" name="isDefault" value={String(isDefault)} />

          <FormField
            id="name"
            label="Họ tên người nhận"
            required
            error={state?.errors?.name}
          >
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name || ""}
              placeholder="Nguyễn Văn A"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="phone"
            label="Số điện thoại"
            required
            hint="Định dạng: 0912345678"
            error={state?.errors?.phone}
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialData?.phone || ""}
              placeholder="0912345678"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="province"
            label="Tỉnh / Thành phố"
            required
            error={state?.errors?.provinceId}
          >
            <Select
              value={selectedProvince}
              onValueChange={(val) => setSelectedProvince(val ?? "")}
              disabled={isPending}
            >
              <SelectTrigger id="province" className="w-full">
                <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {provinces.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="detail"
            label="Địa chỉ chi tiết"
            required
            hint="Số nhà, ngõ/ngách, tên đường, phường/xã, quận/huyện"
            error={state?.errors?.detail}
          >
            <Textarea
              id="detail"
              name="detail"
              defaultValue={initialData?.detail || ""}
              placeholder="Ví dụ: Số 12 ngõ 34 phố Hàng Mã, Hoàn Kiếm"
              required
              disabled={isPending}
              rows={3}
            />
          </FormField>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(!!checked)}
              disabled={isPending || (isEdit && initialData.isDefault)}
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-normal text-muted-foreground cursor-pointer"
            >
              Đặt làm địa chỉ nhận hàng mặc định
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : isEdit ? (
                "Cập nhật"
              ) : (
                "Lưu địa chỉ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
