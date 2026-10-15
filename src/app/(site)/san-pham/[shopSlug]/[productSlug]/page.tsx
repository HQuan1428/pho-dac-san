import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, ChevronRight, Store } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { getProductDetail } from "@/server/store/catalog";
import { RatingStars } from "@/components/common/rating-stars";
import { RegionTag } from "@/components/common/region-tag";
import { ProductCard } from "@/components/common/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchaseBox } from "@/components/store/product-purchase-box";
import { WishlistButton } from "@/components/store/wishlist-button";
import { FollowButton } from "@/components/store/follow-button";
import { ReviewSection } from "@/components/store/review-section";

type PageProps = {
  params: Promise<{ shopSlug: string; productSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shopSlug, productSlug } = await params;
  const data = await getProductDetail(shopSlug, productSlug);
  if (!data) {
    return { title: "Sản phẩm không tìm thấy — Phố Đặc Sản" };
  }

  const { product } = data;
  return {
    title: `${product.name} — ${product.shop.name} | Phố Đặc Sản`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images.length > 0 ? product.images : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { shopSlug, productSlug } = await params;
  const data = await getProductDetail(shopSlug, productSlug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;
  const user = await getCurrentUser();

  let eligibleOrderItemId: string | null = null;
  let isWishlisted = false;
  let isFollowingShop = false;

  if (user) {
    const [eligibleItem, wishlist, follow] = await Promise.all([
      db.orderItem.findFirst({
        where: {
          productId: product.id,
          order: {
            customerId: user.id,
            status: "COMPLETED",
          },
          review: null,
        },
        select: { id: true },
      }),
      db.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
      }),
      db.shopFollow.findUnique({
        where: {
          userId_shopId: {
            userId: user.id,
            shopId: product.shop.id,
          },
        },
      }),
    ]);

    eligibleOrderItemId = eligibleItem?.id ?? null;
    isWishlisted = Boolean(wishlist);
    isFollowingShop = Boolean(follow);
  }

  const currentPath = `/san-pham/${shopSlug}/${productSlug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 space-y-10">
      {/* Breadcrumbs */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link href="/cho" className="hover:text-foreground transition">Chợ</Link>
        <ChevronRight className="size-3" />
        <Link href={`/tim-kiem?danh-muc=${product.category.slug}`} className="hover:text-foreground transition">
          {product.category.name}
        </Link>
        <ChevronRight className="size-3" />
        <Link href={`/gian-hang/${product.shop.slug}`} className="hover:text-foreground transition">
          {product.shop.name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Info (2 columns: Gallery & Info) */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} province={product.province.name} />

        {/* Purchase & Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RegionTag province={product.province.name} />
              <Link
                href={`/tim-kiem?danh-muc=${product.category.slug}`}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                {product.category.name}
              </Link>
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {product.name}
              </h1>
              <WishlistButton
                productId={product.id}
                initialWishlisted={isWishlisted}
                pathname={currentPath}
              />
            </div>

            {/* Ratings & Sold count */}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <a href="#danh-gia" className="flex items-center gap-2 hover:opacity-80 transition">
                <RatingStars value={product.ratingAvg} />
                <span className="font-semibold text-foreground">
                  {product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : "0"}
                </span>
                <span className="text-muted-foreground underline">
                  ({product.ratingCount} đánh giá)
                </span>
              </a>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                Đã bán: <strong className="text-foreground">{product.soldCount}</strong>
              </span>
            </div>
          </div>

          {/* Variant picker and Purchase Box */}
          <ProductPurchaseBox
            variants={product.variants}
            productName={product.name}
          />

          {/* Shop Card with Follow Button */}
          <div className="rounded-lg border bg-card p-4 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="size-12 border">
                {product.shop.logo && <AvatarImage src={product.shop.logo} alt={product.shop.name} />}
                <AvatarFallback className="font-semibold">{product.shop.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/gian-hang/${product.shop.slug}`}
                  className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition"
                >
                  <span className="truncate">{product.shop.name}</span>
                  {product.shop.plan !== "FREE" && (
                    <BadgeCheck className="size-4 shrink-0 text-success" />
                  )}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <RegionTag province={product.shop.province.name} />
                  <span>{product.shop._count.products} món</span>
                  <span>{product.shop._count.followers} theo dõi</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FollowButton
                shopId={product.shop.id}
                initialFollowed={isFollowingShop}
                pathname={currentPath}
              />
              <Link
                href={`/gian-hang/${product.shop.slug}`}
                className="hidden sm:inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium hover:bg-muted transition"
              >
                <Store className="size-3.5 mr-1" />
                <span>Xem gian hàng</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <section className="space-y-4 rounded-lg border bg-card p-6 shadow-xs">
        <h2 className="text-xl font-bold text-foreground">Mô tả sản phẩm</h2>
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line space-y-2">
          {product.description}
        </div>
      </section>

      {/* Reviews Section with #danh-gia */}
      <ReviewSection
        productId={product.id}
        reviews={product.reviews}
        ratingAvg={product.ratingAvg}
        ratingCount={product.ratingCount}
        eligibleOrderItemId={eligibleOrderItemId}
        path={currentPath}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-xl font-bold text-foreground">Sản phẩm cùng danh mục</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
