import Link from "next/link";
import { type Metadata } from "next";
import { Heart } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { WishlistGrid, type WishlistProductItem } from "./wishlist-grid";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích - Phố Đặc Sản",
};

const placeholder = (label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="hsl(150 8% 92%)"/><text x="200" y="208" font-family="sans-serif" font-size="20" text-anchor="middle" fill="hsl(150 6% 55%)">${label}</text></svg>`
  )}`;

export default async function WishlistPage() {
  const user = await requireUser("/account/wishlist");

  const wishlistItems = await db.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          shop: { select: { name: true, slug: true } },
          province: { select: { name: true } },
          variants: { orderBy: { price: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedItems: WishlistProductItem[] = wishlistItems.map((item) => {
    const p = item.product;
    const lowestVariant = p.variants[0];
    const price = lowestVariant?.price ?? 0;
    const originalPrice = lowestVariant?.compareAtPrice ?? undefined;
    const image = p.images[0] || placeholder(p.province.name);

    return {
      productId: p.id,
      cardData: {
        href: `/products/${p.shop.slug}/${p.slug}`,
        name: p.name,
        image,
        price,
        originalPrice,
        province: p.province.name,
        shopName: p.shop.name,
        rating: p.ratingAvg,
        reviewCount: p.ratingCount,
      },
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sản phẩm yêu thích"
        description="Danh sách các món đặc sản bạn đã lưu để xem và mua lại sau"
      />

      {formattedItems.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Chưa có sản phẩm yêu thích"
          description="Bạn chưa lưu món đặc sản nào. Hãy khám phá và bấm vào biểu tượng trái tim để lưu lại nhé!"
          action={<Button render={<Link href="/" />}>Khám phá ngay</Button>}
        />
      ) : (
        <WishlistGrid items={formattedItems} />
      )}
    </div>
  );
}
