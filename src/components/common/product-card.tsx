import Link from "next/link";
import { Heart } from "lucide-react";
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
      className="group flex flex-col overflow-hidden rounded-lg bg-card"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="size-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur">
          <Heart className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-3">
        <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
        <Price amount={product.price} original={product.originalPrice} />
        <RatingStars value={product.rating} count={product.reviewCount} compact />
        <p className="flex items-center gap-2 text-xs text-muted-foreground">{product.shopName} · <RegionTag province={product.province} /></p>
      </div>
    </Link>
  );
}
