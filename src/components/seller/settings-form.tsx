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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Current plan card */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Gói dịch vụ hiện tại</h2>
              <Badge variant="outline" className="font-semibold text-xs border-primary text-primary">
                Gói {shop.plan}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Gói dịch vụ được quản trị viên cấp phát để hỗ trợ quy mô kinh doanh của bạn.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            render={<Link href="/#bang-gia" target="_blank" />}
          >
            <ExternalLink className="size-3.5 mr-1.5" />
            Xem bảng giá & quyền lợi các gói
          </Button>
        </div>
      </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="shop-province" label="Tỉnh/Thành phố cơ sở *" required>
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

          <FormField id="shop-address" label="Địa chỉ chi tiết" hint="Số nhà, đường, thôn xóm">
            <Input
              id="shop-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormField>
        </div>

        <FormField id="shop-desc" label="Giới thiệu gian hàng" hint="Câu chuyện thương hiệu, cam kết chất lượng">
          <Textarea
            id="shop-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Chia sẻ về đặc sản quê hương của gian hàng..."
          />
        </FormField>
      </div>

      {/* Branding: Logo & Banner */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground border-b pb-2">
            Logo gian hàng
          </h3>
          <ImageUploader
            value={logos}
            onChange={setLogos}
            maxImages={1}
            label="Tải lên Logo"
            hint="Ảnh vuông (tối đa 5MB). Hiển thị đại diện cho gian hàng."
          />
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground border-b pb-2">
            Ảnh bìa (Banner)
          </h3>
          <ImageUploader
            value={banners}
            onChange={setBanners}
            maxImages={1}
            label="Tải lên Banner"
            hint="Ảnh ngang (tối đa 5MB). Hiển thị đầu trang gian hàng."
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
          Lưu thông tin gian hàng
        </Button>
      </div>
    </form>
  );
}
