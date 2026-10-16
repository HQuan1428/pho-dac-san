import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, ChevronRight, FileText, Flame, Star, Store, Tag } from "lucide-react";
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

  const currentPath = `/products/${shopSlug}/${productSlug}`;

  return (
    <div className="container-page py-4 md:py-6 space-y-6 pb-20 lg:pb-6">
      {/* Breadcrumbs with icons */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link href="/market" className="inline-flex items-center gap-1 hover:text-foreground transition">
          <Store className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span>Chợ</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" aria-hidden="true" />
        <Link href={`/search?danh-muc=${product.category.slug}`} className="inline-flex items-center gap-1 hover:text-foreground transition">
          <Tag className="size-3 text-muted-foreground" aria-hidden="true" />
          <span>{product.category.name}</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" aria-hidden="true" />
        <Link href={`/shops/${product.shop.slug}`} className="hover:text-foreground transition">
          {product.shop.name}
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" aria-hidden="true" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Info: gallery column (max 560px) + sticky buy box filling the rest */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] xl:gap-12 items-start">
        {/* Gallery left (large gallery max ~520px, thumbnails row) */}
        <div className="flex justify-center lg:justify-start w-full min-w-0">
          <ProductGallery
            images={product.images}
            name={product.name}
            province={product.province.name}
          />
        </div>

        {/* Sticky Buy Box Right */}
        <div className="lg:sticky lg:top-20 space-y-4 rounded-xl border bg-card p-4 sm:p-5 shadow-xs min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <RegionTag province={product.province.name} variant="badge" />
                <span className="text-muted-foreground/50">·</span>
                <Link
                  href={`/search?danh-muc=${product.category.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition truncate"
                >
                  <Tag className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{product.category.name}</span>
                </Link>
              </div>
              <WishlistButton
                productId={product.id}
                initialWishlisted={isWishlisted}
                pathname={currentPath}
              />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl break-words">
              {product.name}
            </h1>

            {/* Ratings & Meta rows with icons: Rating, Sold (Flame) */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <RatingStars value={product.ratingAvg} />
                <span className="font-semibold text-foreground">
                  {product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : "0"}
                </span>
                <span>({product.ratingCount} đánh giá)</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Flame className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                <span>
                  Đã bán: <strong className="text-foreground">{product.soldCount}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Price, Variants, Quantity, CTAs, Shipping/COD notes, and Mobile sticky buy bar */}
          <ProductPurchaseBox
            variants={product.variants}
            productName={product.name}
            showMobileBar={true}
          />

          {/* Shop Mini Card */}
          <div className="rounded-lg border bg-muted/20 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-9 sm:size-10 border shrink-0">
                {product.shop.logo && <AvatarImage src={product.shop.logo} alt={product.shop.name} />}
                <AvatarFallback className="font-semibold text-xs">{product.shop.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/shops/${product.shop.slug}`}
                  className="flex items-center gap-1 font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition"
                >
                  <span className="truncate">{product.shop.name}</span>
                  {product.shop.plan !== "FREE" && (
                    <BadgeCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                  )}
                </Link>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                  <RegionTag province={product.shop.province.name} />
                  <span>·</span>
                  <span>{product.shop._count.products} món</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <FollowButton
                shopId={product.shop.id}
                initialFollowed={isFollowingShop}
                pathname={currentPath}
              />
              <Link
                href={`/shops/${product.shop.slug}`}
                className="hidden sm:inline-flex h-7 items-center justify-center rounded-md border px-2.5 text-xs font-medium hover:bg-muted transition"
              >
                <Store className="size-3 mr-1" aria-hidden="true" />
                <span>Xem shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Mô tả (FileText) / Đánh giá (Star, with count) / Gian hàng (Store) with icons */}
      <Tabs defaultValue="description" className="space-y-4 pt-4 border-t">
        <TabsList variant="line" className="border-b w-full justify-start gap-4 sm:gap-6 h-11 pb-0 overflow-x-auto max-w-full scrollbar-none">
          <TabsTrigger value="description" className="flex items-center gap-1.5 text-sm font-semibold pb-2.5">
            <FileText className="size-4 shrink-0" aria-hidden="true" />
            <span>Mô tả</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-1.5 text-sm font-semibold pb-2.5">
            <Star className="size-4 shrink-0" aria-hidden="true" />
            <span>Đánh giá ({product.ratingCount})</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex items-center gap-1.5 text-sm font-semibold pb-2.5">
            <Store className="size-4 shrink-0" aria-hidden="true" />
            <span>Gian hàng</span>
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

        <TabsContent value="shop" className="rounded-xl border bg-card p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 border shrink-0">
                {product.shop.logo && <AvatarImage src={product.shop.logo} alt={product.shop.name} />}
                <AvatarFallback className="font-semibold text-base">{product.shop.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-foreground">{product.shop.name}</h3>
                  {product.shop.plan !== "FREE" && (
                    <BadgeCheck className="size-4 text-success" aria-hidden="true" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RegionTag province={product.shop.province.name} variant="badge" />
                  <span>·</span>
                  <span>{product.shop._count.products} đặc sản</span>
                  <span>·</span>
                  <span>{product.shop._count.followers} người theo dõi</span>
                </div>
                {product.shop.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl pt-1">
                    {product.shop.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <FollowButton
                shopId={product.shop.id}
                initialFollowed={isFollowingShop}
                pathname={currentPath}
              />
              <Link
                href={`/shops/${product.shop.slug}`}
                className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-medium hover:bg-muted transition"
              >
                <Store className="size-3.5 mr-1.5" aria-hidden="true" />
                <span>Ghé thăm gian hàng</span>
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products as a 5-col rail */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 border-t pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Sản phẩm cùng danh mục</h2>
            <Link
              href={`/search?danh-muc=${product.category.slug}`}
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

