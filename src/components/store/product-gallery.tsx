"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductPlaceholder } from "./placeholder";

export function ProductGallery({
  images,
  name,
  province,
  className,
}: {
  images: string[];
  name: string;
  province?: string;
  className?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const fallbackSvg = getProductPlaceholder(province || name);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full max-w-[560px] flex-col items-center justify-center rounded-lg border bg-muted/50 p-6 text-muted-foreground shadow-xs">
        <Package className="size-16 stroke-1 text-muted-foreground/50" />
        <span className="mt-3 text-sm font-medium">Chưa có hình ảnh sản phẩm</span>
        <span className="mt-1 text-xs text-muted-foreground">Đặc sản chính gốc đóng gói chuẩn chất lượng</span>
      </div>
    );
  }

  const currentImage = failedIndices[activeIdx] ? fallbackSvg : images[activeIdx] || images[0];

  return (
    <div className={cn("flex flex-col gap-3 w-full min-w-0 max-w-[560px] mx-auto lg:mx-0", className)}>
      {/* Main Image (capped max-w-[560px], square, object-cover, rounded-lg) */}
      <div className="relative aspect-square w-full max-w-[560px] overflow-hidden rounded-lg border bg-muted shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={name}
          onError={() => setFailedIndices((prev) => ({ ...prev, [activeIdx]: true }))}
          className="size-full object-cover"
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full" role="group" aria-label="Danh sách ảnh thu nhỏ">
          {images.map((img, i) => {
            const thumbSrc = failedIndices[i] ? fallbackSvg : img;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Xem ảnh ${i + 1}`}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-lg border bg-muted transition cursor-pointer",
                  activeIdx === i
                    ? "border-primary ring-2 ring-primary/30"
                    : "opacity-70 hover:opacity-100 border-border"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbSrc}
                  alt={`${name} - ${i + 1}`}
                  onError={() => setFailedIndices((prev) => ({ ...prev, [i]: true }))}
                  className="size-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
