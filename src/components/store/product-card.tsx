"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { Price } from "@/components/common/price";
import { RatingStars } from "@/components/common/rating-stars";
import { RegionTag } from "@/components/common/region-tag";
import { getProductPlaceholder } from "./placeholder";
import type { ProductCardData } from "@/components/common/product-card";

export type { ProductCardData };

export function ProductCard({ product }: { product: ProductCardData }) {
  const fallbackSvg = getProductPlaceholder(product.province || product.name);
  const [imgSrc, setImgSrc] = useState<string>(product.image || fallbackSvg);

  useEffect(() => {
    if (!product.image) {
      setImgSrc(fallbackSvg);
      return;
    }
    const testImg = new window.Image();
    testImg.src = product.image;
    testImg.onerror = () => {
      setImgSrc(fallbackSvg);
    };
  }, [product.image, fallbackSvg]);

  return (
    <Link
      href={product.href}
      className="group flex flex-col overflow-hidden rounded-lg bg-card border border-border/60 hover:border-border hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(fallbackSvg)}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-1 text-muted-foreground/80 backdrop-blur transition hover:text-destructive">
          <Heart className="size-3.5" aria-hidden="true" />
        </span>

        {/* Hover "Xem nhanh" pill (decorative; entire card is the link) */}
        <div className="absolute inset-x-0 bottom-2.5 flex justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-xs backdrop-blur opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
            <Eye className="size-3 text-primary" aria-hidden="true" />
            <span>Xem nhanh</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-2 text-xs sm:text-sm font-medium leading-snug group-hover:text-primary transition">
          {product.name}
        </h3>
        <div className="mt-auto pt-1 space-y-1">
          <Price
            amount={product.price}
            original={product.originalPrice}
            className="text-sm sm:text-base font-semibold"
          />
          <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
            <RatingStars value={product.rating} count={product.reviewCount} compact />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate pt-0.5">
            <span className="truncate">{product.shopName}</span>
            <span>·</span>
            <RegionTag province={product.province} />
          </div>
        </div>
      </div>
    </Link>
  );
}
