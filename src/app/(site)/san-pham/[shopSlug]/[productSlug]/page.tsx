import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, ChevronRight, Store } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { getProductDetail } from "@/server/store/catalog";
import { RatingStars } from "@/components/common/rating-stars";
import { RegionTag } from "@/components/common/region-tag";
import { ProductCard } from "@/components/store/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="container-page py-6 md:py-8 space-y-8">
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

      {/* Main Product Info: Gallery Left + Sticky Buy Box Right (minmax(0,1fr) 420px) */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] items-start">
        {/* Gallery left (main image max ~560px, thumbnails row) */}
        <div className="flex justify-center lg:justify-start">
          <ProductGallery
            images={product.images}
            name={product.name}
            province={product.province.name}
          />
        </div>

        {/* Sticky Buy Box Right */}
        <div className="lg:sticky lg:top-20 space-y-4 rounded-xl border bg-card p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <RegionTag province={product.province.name} />
                <span>·</span>
                <Link
                  href={`/tim-kiem?danh-muc=${product.category.slug}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition"
                >
                  {product.category.name}
                </Link>
              </div>
              <WishlistButton
                productId={product.id}
                initialWishlisted={isWishlisted}
                pathname={currentPath}
              />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {product.name}
            </h1>

            {/* Ratings & Sold count */}
            <div className="mt-2.5 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <RatingStars value={product.ratingAvg} />
                <span className="font-semibold text-foreground">
                  {product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : "0"}
                </span>
                <span className="text-muted-foreground">
                  ({product.ratingCount} đánh giá)
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                Đã bán: <strong className="text-foreground">{product.soldCount}</strong>
              </span>
            </div>
          </div>

          {/* Price, Variants, Quantity, CTAs, Shipping/COD notes */}
          <ProductPurchaseBox
            variants={product.variants}
            productName={product.name}
          />

          {/* Shop Mini Card */}
          <div className="rounded-lg border bg-muted/20 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-10 border shrink-0">
                {product.shop.logo && <AvatarImage src={product.shop.logo} alt={product.shop.name} />}
                <AvatarFallback className="font-semibold text-xs">{product.shop.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/gian-hang/${product.shop.slug}`}
                  className="flex items-center gap-1 font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition"
                >
                  <span className="truncate">{product.shop.name}</span>
                  {product.shop.plan !== "FREE" && (
                    <BadgeCheck className="size-3.5 shrink-0 text-success" />
                  )}
                </Link>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <RegionTag province={product.shop.province.name} />
                  <span>·</span>
                  <span>{product.shop._count.products} món</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <FollowButton
                shopId={product.shop.id}
                initialFollowed={isFollowingShop}
                pathname={currentPath}
              />
              <Link
                href={`/gian-hang/${product.shop.slug}`}
                className="hidden sm:inline-flex h-7 items-center justify-center rounded-md border px-2.5 text-xs font-medium hover:bg-muted transition"
              >
                <Store className="size-3 mr-1" />
                <span>Xem shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Tabs (or Two-column layout) */}
      <Tabs defaultValue="description" className="space-y-4 pt-4 border-t">
        <TabsList variant="line" className="border-b w-full justify-start gap-6 h-10 pb-0">
          <TabsTrigger value="description" className="text-sm font-semibold pb-2">
            Mô tả sản phẩm
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm font-semibold pb-2">
            Đánh giá & Nhận xét ({product.ratingCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="rounded-xl border bg-card p-6 shadow-xs">
          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line space-y-3">
            {product.description}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewSection
            productId={product.id}
            reviews={product.reviews}
            ratingAvg={product.ratingAvg}
            ratingCount={product.ratingCount}
            eligibleOrderItemId={eligibleOrderItemId}
            path={currentPath}
          />
        </TabsContent>
      </Tabs>

      {/* Related Products as a 5-col rail */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 border-t pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Sản phẩm cùng danh mục</h2>
            <Link
              href={`/tim-kiem?danh-muc=${product.category.slug}`}
              className="text-xs text-primary font-medium hover:underline"
            >
              Xem thêm trong danh mục
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
