"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
  province?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border bg-muted/50 p-6 text-muted-foreground">
        <Package className="size-20 stroke-1 text-muted-foreground/50" />
        <span className="mt-3 text-sm font-medium">Chưa có hình ảnh sản phẩm</span>
        <span className="mt-1 text-xs text-muted-foreground">Đặc sản chính gốc đóng gói chuẩn chất lượng</span>
      </div>
    );
  }

  const currentImage = images[activeIdx] || images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={name}
          className="size-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted transition",
                activeIdx === i ? "border-primary ring-2 ring-primary/20" : "opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${name} - ${i + 1}`} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
