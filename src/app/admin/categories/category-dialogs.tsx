"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
import { createCategory, updateCategory, deleteCategory } from "./actions";

type CategoryOption = {
  id: string;
  name: string;
};

export function CreateCategoryDialog({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const res = await createCategory(formData);
        if (res.success) {
          toast.success("Đã thêm danh mục mới");
          setOpen(false);
          form.reset();
        } else {
          toast.error(res.error || "Không thể tạo danh mục");
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
        Thêm danh mục
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm danh mục đặc sản mới</DialogTitle>
          <DialogDescription>
            Đường dẫn (slug) sẽ được tự động tạo từ tên danh mục.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="create-name">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-name"
              name="name"
              placeholder="Ví dụ: Rượu & Đồ uống lên men"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-parent">Danh mục cha (tùy chọn)</Label>
            <Select
              name="parentId"
              defaultValue="none"
              items={[
                { value: "none", label: "-- Không thuộc danh mục cha (Cấp 1) --" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            >
              <SelectTrigger id="create-parent" className="w-full">
                <SelectValue placeholder="Chọn danh mục cha nếu có" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Không thuộc danh mục cha (Cấp 1) --</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="create-sortOrder">Thứ tự hiển thị</Label>
            <Input
              id="create-sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={0}
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
              {isPending ? "Đang lưu..." : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditCategoryDialog({
  category,
  allCategories,
}: {
  category: {
    id: string;
    name: string;
    parentId: string | null;
    sortOrder: number;
  };
  allCategories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const parentOptions = allCategories.filter((c) => c.id !== category.id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await updateCategory(category.id, formData);
        if (res.success) {
          toast.success("Đã cập nhật danh mục");
          setOpen(false);
        } else {
          toast.error(res.error || "Không thể cập nhật danh mục");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="xs" variant="ghost" title="Chỉnh sửa" />}>
        <Edit2 className="size-3.5" />
        <span className="sr-only">Sửa</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          <DialogDescription>
            Cập nhật tên, danh mục cha hoặc thứ tự hiển thị.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor={`edit-name-${category.id}`}>
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`edit-name-${category.id}`}
              name="name"
              defaultValue={category.name}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`edit-parent-${category.id}`}>Danh mục cha</Label>
            <Select
              name="parentId"
              defaultValue={category.parentId || "none"}
              items={[
                { value: "none", label: "-- Không thuộc danh mục cha (Cấp 1) --" },
                ...parentOptions.map((c) => ({ value: c.id, label: c.name })),
              ]}
            >
              <SelectTrigger id={`edit-parent-${category.id}`} className="w-full">
                <SelectValue placeholder="Chọn danh mục cha nếu có" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Không thuộc danh mục cha (Cấp 1) --</SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`edit-sort-${category.id}`}>Thứ tự hiển thị</Label>
            <Input
              id={`edit-sort-${category.id}`}
              name="sortOrder"
              type="number"
              defaultValue={category.sortOrder}
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
              {isPending ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
}: {
  categoryId: string;
  categoryName: string;
  productCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteCategory(categoryId);
        if (res.success) {
          toast.success(`Đã xóa danh mục "${categoryName}"`);
          setOpen(false);
        } else {
          toast.error(res.error || "Không thể xóa danh mục");
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
          <Button
            size="xs"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            title="Xóa danh mục"
          />
        }
      >
        <Trash2 className="size-3.5" />
        <span className="sr-only">Xóa</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa danh mục &ldquo;{categoryName}&rdquo;?
          </DialogDescription>
        </DialogHeader>

        {productCount > 0 ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            Danh mục này đang chứa <strong>{productCount}</strong> sản phẩm. Quy định sàn không cho phép xóa danh mục đã có sản phẩm.
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Hành động này sẽ xóa danh mục vĩnh viễn khỏi hệ thống.
          </p>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || productCount > 0}
          >
            {isPending ? "Đang xóa..." : "Xóa danh mục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
