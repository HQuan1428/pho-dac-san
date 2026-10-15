import { PageHeader } from "@/components/common/page-header";
import { getProductFormData, getSellerProductById } from "@/server/seller/products";
import { ProductForm } from "@/components/seller/product-form";

export const metadata = {
  title: "Chỉnh sửa sản phẩm",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, { categories, provinces }] = await Promise.all([
    getSellerProductById(id),
    getProductFormData(),
  ]);

  const initialData = {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    provinceId: product.provinceId,
    description: product.description,
    images: product.images,
    status: product.status,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      sku: v.sku,
    })),
    _count: product._count,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chỉnh sửa: ${product.name}`}
        description="Cập nhật thông tin chi tiết, hình ảnh, phân loại hoặc trạng thái kinh doanh"
      />

      <ProductForm
        categories={categories}
        provinces={provinces}
        initialData={initialData}
      />
    </div>
  );
}
