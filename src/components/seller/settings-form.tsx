"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/common/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./image-uploader";
import {
  updateShopSettingsAction,
  type ShopSettingsFormValues,
} from "@/server/seller/settings";

interface SettingsFormProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    phone: string;
    address: string | null;
    provinceId: string;
    logo: string | null;
    banner: string | null;
    plan: "FREE" | "PRO" | "BUSINESS";
  };
  provinces: { id: string; name: string }[];
}

export function SettingsForm({ shop, provinces }: SettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description || "");
  const [phone, setPhone] = useState(shop.phone);
  const [address, setAddress] = useState(shop.address || "");
  const [provinceId, setProvinceId] = useState(shop.provinceId);
  const [logos, setLogos] = useState<string[]>(shop.logo ? [shop.logo] : []);
  const [banners, setBanners] = useState<string[]>(shop.banner ? [shop.banner] : []);
  const [loading, setLoading] = useState(false);

  const provinceItems = provinces.map((p) => ({ value: p.id, label: p.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên gian hàng");
      return;
    }
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setLoading(true);

    const payload: ShopSettingsFormValues = {
      name: name.trim(),
      description: description.trim() || null,
      phone: phone.trim(),
      address: address.trim() || null,
      provinceId,
      logo: logos[0] || null,
      banner: banners[0] || null,
    };

    try {
      const res = await updateShopSettingsAction(payload);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Cập nhật thông tin gian hàng thành công");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 2 columns at lg: main fields left (2/3), side panel right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main fields left (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic shop profile */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b pb-3">
              Thông tin gian hàng
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="shop-name" label="Tên gian hàng *" required hint="Tên thương hiệu hoặc cửa hàng">
                <Input
                  id="shop-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormField>

              <FormField id="shop-phone" label="Số điện thoại gọi xác nhận *" required hint="Dùng để liên hệ khách hàng">
                <Input
                  id="shop-phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </FormField>
            </div>

            <FormField id="shop-address" label="Địa chỉ chi tiết" hint="Số nhà, đường, thôn xóm, xã/phường">
              <Input
                id="shop-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormField>

            <FormField id="shop-desc" label="Giới thiệu gian hàng" hint="Câu chuyện thương hiệu, cam kết chất lượng đặc sản">
              <Textarea
                id="shop-desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chia sẻ về đặc sản quê hương của gian hàng..."
              />
            </FormField>
          </div>

          {/* Current plan card */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Gói dịch vụ hiện tại</h3>
                <Badge variant="outline" className="font-semibold text-xs border-primary text-primary font-mono">
                  Gói {shop.plan}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="xs"
                render={<Link href="/#pricing" target="_blank" />}
              >
                <ExternalLink className="size-3 mr-1.5" />
                Xem bảng giá & quyền lợi các gói
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Gói dịch vụ được ban quản trị phân quyền hỗ trợ quy mô kinh doanh và công cụ bán hàng tối ưu cho gian hàng của bạn.
            </p>
          </div>
        </div>

        {/* Side panel right (1/3 width, sticky actions, province, images) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
          {/* Sticky Actions Card */}
          <div className="rounded-lg border bg-card p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Lưu thay đổi
            </h3>
            <div className="space-y-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                Lưu thông tin gian hàng
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs"
                render={<Link href={`/shop/${shop.slug}`} target="_blank" />}
              >
                <ExternalLink className="size-3.5 mr-1.5" />
                Xem trang gian hàng
              </Button>
            </div>
          </div>

          {/* Province card */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Khu vực hoạt động
            </h3>
            <FormField id="shop-province" label="Tỉnh/Thành phố cơ sở *" required hint="Tỉnh đặt trụ sở hoặc cơ sở sản xuất">
              <Select value={provinceId} onValueChange={(val) => val && setProvinceId(val)}>
                <SelectTrigger id="shop-province" className="w-full">
                  <SelectValue />
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

          {/* Branding: Logo & Banner */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Hình ảnh thương hiệu
            </h3>

            <div>
              <p className="text-xs font-medium text-foreground mb-1.5">Logo gian hàng</p>
              <ImageUploader
                value={logos}
                onChange={setLogos}
                maxImages={1}
                label="Tải lên Logo"
                hint="Ảnh vuông (tối đa 5MB). Hiển thị đại diện cho gian hàng."
              />
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-medium text-foreground mb-1.5">Ảnh bìa (Banner)</p>
              <ImageUploader
                value={banners}
                onChange={setBanners}
                maxImages={1}
                label="Tải lên Banner"
                hint="Ảnh ngang (tối đa 5MB). Hiển thị đầu trang gian hàng."
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
