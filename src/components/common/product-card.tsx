import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { Price } from "./price";
import { RatingStars } from "./rating-stars";
import { RegionTag } from "./region-tag";

export type ProductCardData = {
  href: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  province: string;
  shopName: string;
  rating: number;
  reviewCount: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={product.href}
      className="group flex flex-col overflow-hidden rounded-lg bg-card border border-border/60 hover:border-border hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur">
          <Heart className="size-4" aria-hidden="true" />
        </span>

        {/* Hover "Xem nhanh" pill (decorative; entire card is the link) */}
        <div className="absolute inset-x-0 bottom-2.5 flex justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-xs backdrop-blur opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
            <Eye className="size-3 text-primary" aria-hidden="true" />
            <span>Xem nhanh</span>
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:pt-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary transition">{product.name}</h3>
        <Price amount={product.price} original={product.originalPrice} />
        <RatingStars value={product.rating} count={product.reviewCount} compact />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5 truncate">
          <span className="truncate">{product.shopName}</span>
          <span>·</span>
          <RegionTag province={product.province} />
        </p>
      </div>
    </Link>
  );
}
