import { PageHeader } from "@/components/common/page-header";
import { getShopSettingsData } from "@/server/seller/settings";
import { SettingsForm } from "@/components/seller/settings-form";

export const metadata = {
  title: "Cài đặt gian hàng",
};

export default async function ShopSettingsPage() {
  const { shop, provinces } = await getShopSettingsData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thiết lập gian hàng"
        description="Quản lý thông tin thương hiệu, địa chỉ, hình ảnh đại diện và gói dịch vụ"
      />

      <SettingsForm shop={shop} provinces={provinces} />
    </div>
  );
}
