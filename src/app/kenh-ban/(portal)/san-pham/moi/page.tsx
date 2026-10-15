import { PageHeader } from "@/components/common/page-header";
import { getProductFormData } from "@/server/seller/products";
import { ProductForm } from "@/components/seller/product-form";

export const metadata = {
  title: "Thêm sản phẩm mới",
};

export default async function NewProductPage() {
  const { categories, provinces } = await getProductFormData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm sản phẩm mới"
        description="Đăng bán đặc sản mới với thông tin chi tiết, hình ảnh và các quy cách đóng gói"
      />

      <ProductForm categories={categories} provinces={provinces} />
    </div>
  );
}
