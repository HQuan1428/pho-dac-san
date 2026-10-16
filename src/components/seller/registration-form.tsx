"use client";

import { useState } from "react";
import { Loader2, Store } from "lucide-react";
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
import { registerShopAction } from "@/server/seller/registration";

interface RegistrationFormProps {
  provinces: {
    id: string;
    name: string;
    region: { name: string };
  }[];
  defaultPhone?: string;
}

export function RegistrationForm({ provinces, defaultPhone = "" }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [provinceId, setProvinceId] = useState(provinces[0]?.id || "");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên gian hàng");
      return;
    }
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!provinceId) {
      toast.error("Vui lòng chọn Tỉnh/Thành phố");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("provinceId", provinceId);
    if (address.trim()) formData.append("address", address.trim());
    if (description.trim()) formData.append("description", description.trim());

    try {
      const res = await registerShopAction(formData);
      if (res?.error) {
        toast.error(res.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      // Next.js redirect throws a special error which shouldn't be caught as standard failure
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : "Đăng ký thất bại";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        id="reg-name"
        label="Tên gian hàng"
        required
        hint="Tên đại diện thương hiệu hoặc cơ sở đặc sản của bạn"
      >
        <Input
          id="reg-name"
          required
          placeholder="VD: Nhà Mắm Sầm Sơn, Chè Tân Cương Xanh..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="reg-phone"
          label="Số điện thoại liên hệ"
          required
          hint="Dùng để gọi xác nhận đơn hàng với khách"
        >
          <Input
            id="reg-phone"
            required
            placeholder="0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormField>

        <FormField
          id="reg-province"
          label="Tỉnh/Thành phố cơ sở"
          required
          hint="Nơi đặt trụ sở hoặc cơ sở sản xuất đặc sản"
        >
          <Select items={provinces.map((x) => ({ value: x.id, label: x.name }))} value={provinceId} onValueChange={(val) => val && setProvinceId(val)}>
            <SelectTrigger id="reg-province" className="w-full">
              <SelectValue placeholder="Chọn Tỉnh/Thành" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.region.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        id="reg-address"
        label="Địa chỉ chi tiết"
        hint="Số nhà, ngõ/đường, xã/phường (không bắt buộc)"
      >
        <Input
          id="reg-address"
          placeholder="VD: Số 12 đường Thanh Niên, Phường Trường Sơn"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </FormField>

      <FormField
        id="reg-desc"
        label="Giới thiệu gian hàng"
        hint="Đôi nét về các món đặc sản chính hoặc truyền thống làm nghề của bạn"
      >
        <Textarea
          id="reg-desc"
          rows={4}
          placeholder="Giới thiệu ngắn về nguồn gốc, quy trình và đặc sản của bạn..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormField>

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full gap-2 text-base py-5">
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Store className="size-5" />
          )}
          Gửi hồ sơ đăng ký gian hàng
        </Button>
      </div>
    </form>
  );
}
