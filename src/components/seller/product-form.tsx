"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageUploader } from "./image-uploader";
import { VariantTable, type VariantItem } from "./variant-table";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  type ProductFormValues,
} from "@/server/seller/products";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  provinces: { id: string; name: string }[];
  initialData?: {
    id: string;
    name: string;
    categoryId: string;
    provinceId: string;
    description: string;
    images: string[];
    status: "DRAFT" | "ACTIVE" | "HIDDEN";
    variants: VariantItem[];
    _count?: { orderItems: number };
  };
}

export function ProductForm({ categories, provinces, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || "");
  const [provinceId, setProvinceId] = useState(initialData?.provinceId || provinces[0]?.id || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "HIDDEN">(
    initialData?.status || "ACTIVE"
  );
  const [variants, setVariants] = useState<VariantItem[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants
      : [
          {
            name: "Tiêu chuẩn",
            price: 50000,
            compareAtPrice: null,
            stock: 50,
            sku: "",
          },
        ]
  );

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const orderItemsCount = initialData?._count?.orderItems || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Mô tả sản phẩm phải có ít nhất 10 ký tự");
      return;
    }
    if (variants.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 phân loại hàng");
      return;
    }
    for (const [idx, v] of variants.entries()) {
      if (!v.name.trim()) {
        toast.error(`Phân loại hàng thứ #${idx + 1} chưa có tên`);
        return;
      }
      if (v.price < 1000) {
        toast.error(`Giá của phân loại "${v.name}" phải từ 1.000 đ`);
        return;
      }
      if (v.compareAtPrice && v.compareAtPrice <= v.price) {
        toast.error(`Giá niêm yết của "${v.name}" phải lớn hơn giá bán`);
        return;
      }
      if (v.stock < 0) {
        toast.error(`Số lượng kho của "${v.name}" không hợp lệ`);
        return;
      }
    }

    setLoading(true);

    const payload: ProductFormValues = {
      name: name.trim(),
      categoryId,
      provinceId,
      description: description.trim(),
      images,
      status,
      variants,
    };

    try {
      if (isEdit && initialData) {
        const res = await updateProductAction(initialData.id, payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Cập nhật sản phẩm thành công");
          router.push("/seller/products");
          router.refresh();
        }
      } else {
        const res = await createProductAction(payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Tạo sản phẩm mới thành công");
          router.push("/seller/products");
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

  const handleDelete = async () => {
    if (!initialData) return;
    setDeleting(true);

    try {
      const res = await deleteProductAction(initialData.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã xóa sản phẩm thành công");
        router.push("/seller/products");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa sản phẩm thất bại";
      toast.error(msg);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          render={<Link href="/seller/products" />}
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Quay lại danh sách sản phẩm
        </Button>

        {isEdit && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm" type="button" className="text-destructive hover:bg-destructive/10" />
              }
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Xóa sản phẩm
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xóa sản phẩm &quot;{name}&quot;?</DialogTitle>
                <DialogDescription>
                  {orderItemsCount > 0 ? (
                    <span className="text-destructive font-medium block mt-1">
                      Sản phẩm này đã có {orderItemsCount} lượt đặt hàng trong hệ thống. Theo quy
                      định bảo toàn lịch sử đơn hàng, bạn không thể xóa sản phẩm. Bạn nên chuyển trạng
                      thái sang &quot;Ẩn&quot; (HIDDEN) để ngừng bán.
                    </span>
                  ) : (
                    "Hành động này không thể hoàn tác. Sản phẩm và toàn bộ phân loại liên quan sẽ bị xóa hoàn toàn."
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Đóng
                </Button>
                {orderItemsCount === 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
                    Xác nhận xóa
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 2 columns at lg: main fields left (2/3), side panel right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main fields left (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic information */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b pb-3">
              Thông tin cơ bản
            </h2>

            <FormField id="name" label="Tên sản phẩm" required hint="Tên gọi đặc sản, rõ ràng, dễ tìm kiếm">
              <Input
                id="name"
                required
                placeholder="VD: Mắm tép Gia Viễn Ninh Bình hũ 500g"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>

            <FormField
              id="description"
              label="Mô tả chi tiết"
              required
              hint="Mô tả hương vị, nguyên liệu, hạn sử dụng, cách dùng và đóng gói"
            >
              <Textarea
                id="description"
                rows={6}
                required
                placeholder="Mô tả chi tiết đặc sản của bạn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>
          </div>

          {/* Variants table */}
          <div className="rounded-lg border bg-card p-5">
            <VariantTable variants={variants} onChange={setVariants} />
          </div>
        </div>

        {/* Side panel right (1/3 width, sticky actions, status, category/province, images) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
          {/* Sticky Actions Card */}
          <div className="rounded-lg border bg-card p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Hành động
            </h3>
            <div className="space-y-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                {isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                render={<Link href="/seller/products" />}
              >
                Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Business Status */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Trạng thái kinh doanh
            </h3>

            <div className="space-y-2">
              {[
                {
                  value: "ACTIVE" as const,
                  label: "Đang bán (ACTIVE)",
                  desc: "Hiển thị công khai",
                },
                {
                  value: "DRAFT" as const,
                  label: "Bản nháp (DRAFT)",
                  desc: "Chỉ hiện trong quản trị",
                },
                {
                  value: "HIDDEN" as const,
                  label: "Ẩn (HIDDEN)",
                  desc: "Tạm dừng bán",
                },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`flex items-start gap-2.5 rounded-md border p-2.5 cursor-pointer transition-colors ${
                    status === item.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="product-status"
                    value={item.value}
                    checked={status === item.value}
                    onChange={() => setStatus(item.value)}
                    className="accent-primary mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold block text-foreground">{item.label}</span>
                    <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category & Province */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Phân loại & Xuất xứ
            </h3>

            <FormField id="category" label="Danh mục đặc sản" required>
              <Select items={categories.map((x) => ({ value: x.id, label: x.name }))} value={categoryId} onValueChange={(val) => val && setCategoryId(val)}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="province" label="Tỉnh/Thành xuất xứ" required hint="Nguồn gốc chỉ dẫn địa lý">
              <Select items={provinces.map((x) => ({ value: x.id, label: x.name }))} value={provinceId} onValueChange={(val) => val && setProvinceId(val)}>
                <SelectTrigger id="province" className="w-full">
                  <SelectValue placeholder="Chọn tỉnh xuất xứ" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Product Images */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Hình ảnh sản phẩm
            </h3>
            <ImageUploader value={images} onChange={setImages} maxImages={8} />
          </div>
        </div>
      </div>
    </form>
  );
}
