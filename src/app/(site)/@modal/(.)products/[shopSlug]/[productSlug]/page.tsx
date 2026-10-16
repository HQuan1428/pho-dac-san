import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, ExternalLink, Flame, Store } from "lucide-react";
import { getProductDetail } from "@/server/store/catalog";
import { RouteModal } from "@/components/common/route-modal";
import { RatingStars } from "@/components/common/rating-stars";
import { RegionTag } from "@/components/common/region-tag";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchaseBox } from "@/components/store/product-purchase-box";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PageProps = {
  params: Promise<{ shopSlug: string; productSlug: string }>;
};

export default async function ProductQuickViewPage({ params }: PageProps) {
  const { shopSlug, productSlug } = await params;
  const data = await getProductDetail(shopSlug, productSlug);

  if (!data) {
    notFound();
  }

  const { product } = data;

  return (
    <RouteModal variant="dialog" title={product.name} className="sm:max-w-4xl">
      <div className="grid gap-6 sm:grid-cols-2 items-start p-1 sm:p-2">
        {/* Gallery Left */}
        <div className="flex justify-center w-full">
          <ProductGallery
            images={product.images}
            name={product.name}
            province={product.province.name}
            className="max-w-full"
          />
        </div>

        {/* Purchase Box & Info Right */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <RegionTag province={product.province.name} variant="badge" />
              <span className="text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground truncate">
                {product.category.name}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {product.name}
            </h2>

            {/* Ratings & Sold count */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
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

            {/* Short description */}
            {product.description && (
              <p className="mt-2.5 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Price, Variant chips, Quantity, Add to Cart (solid green), Buy now (outline) */}
          <ProductPurchaseBox
            variants={product.variants}
            productName={product.name}
            showMobileBar={false}
            showTrustBadges={false}
          />

          {/* Shop Row */}
          <div className="rounded-lg border bg-muted/20 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-9 border shrink-0">
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

            <Link
              href={`/shops/${product.shop.slug}`}
              className="inline-flex h-7 items-center justify-center rounded-md border px-2 text-xs font-medium hover:bg-muted transition shrink-0"
            >
              <Store className="size-3 mr-1" aria-hidden="true" />
              <span>Xem shop</span>
            </Link>
          </div>

          {/* Full page link (<a href>, not Link) */}
          <div className="pt-2 border-t">
            <a
              href={`/products/${shopSlug}/${productSlug}`}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              <span>Xem chi tiết</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </RouteModal>
  );
}
