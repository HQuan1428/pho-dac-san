"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Edit2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRegion, addProvince, updateProvince } from "./actions";

type RegionItem = {
  id: string;
  name: string;
};

export function EditRegionDialog({
  region,
}: {
  region: { id: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await updateRegion(formData);
        if (res.success) {
          toast.success("Đã đổi tên vùng miền");
          setOpen(false);
        } else {
          toast.error(res.error || "Không thể cập nhật");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="xs" variant="ghost" title="Đổi tên vùng" />}>
        <Edit2 className="size-3.5" />
        <span className="sr-only">Đổi tên vùng</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi tên vùng miền</DialogTitle>
          <DialogDescription>
            Đường dẫn (slug) sẽ được cập nhật tự động theo tên mới.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <input type="hidden" name="id" value={region.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`region-name-${region.id}`}>Tên vùng miền</Label>
            <Input
              id={`region-name-${region.id}`}
              name="name"
              defaultValue={region.name}
              required
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddProvinceDialog({
  regions,
  defaultRegionId,
}: {
  regions: RegionItem[];
  defaultRegionId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const res = await addProvince(formData);
        if (res.success) {
          toast.success("Đã thêm tỉnh/thành mới");
          setOpen(false);
          form.reset();
        } else {
          toast.error(res.error || "Không thể thêm tỉnh/thành");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus data-icon="inline-start" className="size-4" />
        Thêm tỉnh/thành
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm tỉnh/thành mới</DialogTitle>
          <DialogDescription>
            Nhập tên tỉnh thành và chọn vùng miền trực thuộc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="add-province-name">
              Tên tỉnh/thành phố <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-province-name"
              name="name"
              placeholder="Ví dụ: Quảng Ninh"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-province-region">
              Vùng miền <span className="text-destructive">*</span>
            </Label>
            <Select
              name="regionId"
              defaultValue={defaultRegionId || regions[0]?.id}
              items={regions.map((r) => ({ value: r.id, label: r.name }))}
            >
              <SelectTrigger id="add-province-region" className="w-full">
                <SelectValue placeholder="Chọn vùng miền" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Thêm tỉnh/thành"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditProvinceDialog({
  province,
  regions,
}: {
  province: {
    id: string;
    name: string;
    regionId: string;
  };
  regions: RegionItem[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await updateProvince(formData);
        if (res.success) {
          toast.success(`Đã cập nhật tỉnh/thành "${province.name}"`);
          setOpen(false);
        } else {
          toast.error(res.error || "Không thể cập nhật");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="xs" variant="ghost" title="Sửa tên hoặc chuyển vùng" />
        }
      >
        <ArrowRightLeft className="size-3.5" />
        <span className="sr-only">Chỉnh sửa / chuyển vùng</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa / Chuyển vùng tỉnh/thành</DialogTitle>
          <DialogDescription>
            Đổi tên tỉnh thành hoặc chuyển sang vùng miền khác.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <input type="hidden" name="id" value={province.id} />

          <div className="space-y-1.5">
            <Label htmlFor={`edit-prov-name-${province.id}`}>
              Tên tỉnh/thành phố <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`edit-prov-name-${province.id}`}
              name="name"
              defaultValue={province.name}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`edit-prov-region-${province.id}`}>
              Vùng miền trực thuộc <span className="text-destructive">*</span>
            </Label>
            <Select
              name="regionId"
              defaultValue={province.regionId}
              items={regions.map((r) => ({ value: r.id, label: r.name }))}
            >
              <SelectTrigger id={`edit-prov-region-${province.id}`} className="w-full">
                <SelectValue placeholder="Chọn vùng miền" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
