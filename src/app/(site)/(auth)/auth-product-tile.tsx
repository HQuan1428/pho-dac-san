"use client";

import { useState } from "react";
import { Package } from "lucide-react";

export function AuthProductTile({
  src,
  alt,
  province,
  name,
}: {
  src: string;
  alt: string;
  province: string;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="group relative h-24 xl:h-26 overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xs">
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="size-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center bg-muted/90 p-3 text-center text-muted-foreground">
          <Package className="mb-1 size-5 opacity-60" />
          <span className="text-[11px] font-medium leading-tight line-clamp-1">{name}</span>
          <span className="mt-0.5 text-[10px] text-muted-foreground/80">{province}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-2 left-2 right-2 text-white pointer-events-none">
        <span className="inline-block rounded-xs bg-black/40 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-xs">
          {province}
        </span>
        <p className="truncate text-xs font-semibold drop-shadow-xs">{name}</p>
      </div>
    </div>
  );
}
