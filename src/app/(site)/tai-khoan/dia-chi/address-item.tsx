"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Edit, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AddressFormDialog,
  type AddressData,
  type ProvinceOption,
} from "./address-form-dialog";
import { deleteAddressAction, setDefaultAddressAction } from "./actions";

export function AddressItem({
  address,
  provinceName,
  provinces,
}: {
  address: AddressData;
  provinceName: string;
  provinces: ProvinceOption[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = () => {
    startTransition(async () => {
      const res = await setDefaultAddressAction(address.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã đặt làm địa chỉ mặc định");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    startTransition(async () => {
      const res = await deleteAddressAction(address.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã xóa địa chỉ");
      }
    });
  };

  return (
    <Card className={address.isDefault ? "border-primary/50 bg-primary/[0.02]" : ""}>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{address.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{address.phone}</span>
            {address.isDefault && (
              <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                Mặc định
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {address.detail}, {provinceName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:self-start">
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetDefault}
              disabled={isPending}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Đặt mặc định
            </Button>
          )}

          <AddressFormDialog
            provinces={provinces}
            initialData={address}
            trigger={
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                className="text-xs"
              >
                <Edit className="size-3.5" />
                Sửa
              </Button>
            }
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
