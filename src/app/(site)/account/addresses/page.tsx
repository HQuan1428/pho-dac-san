import { type Metadata } from "next";
import { MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { AddressFormDialog } from "./address-form-dialog";
import { AddressItem } from "./address-item";

export const metadata: Metadata = {
  title: "Sổ địa chỉ - Phố Đặc Sản",
};

export default async function AddressBookPage() {
  const user = await requireUser("/account/addresses");

  const [addresses, provinces] = await Promise.all([
    db.address.findMany({
      where: { userId: user.id },
      include: {
        province: {
          select: { name: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    db.province.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sổ địa chỉ"
        description="Quản lý địa chỉ giao hàng để đặt mua đặc sản nhanh chóng hơn"
        actions={<AddressFormDialog provinces={provinces} />}
      />

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Chưa lưu địa chỉ nào"
          description="Thêm địa chỉ giao hàng của bạn để không phải nhập lại mỗi lần đặt hàng."
          action={<AddressFormDialog provinces={provinces} />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <AddressItem
              key={addr.id}
              address={{
                id: addr.id,
                name: addr.name,
                phone: addr.phone,
                provinceId: addr.provinceId,
                detail: addr.detail,
                isDefault: addr.isDefault,
              }}
              provinceName={addr.province.name}
              provinces={provinces}
            />
          ))}
        </div>
      )}
    </div>
  );
}
