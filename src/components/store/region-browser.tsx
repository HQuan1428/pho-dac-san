"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { regionTone } from "@/lib/ui-icons";
import { cn } from "@/lib/utils";

export type ProvinceData = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

export type RegionData = {
  id: string;
  name: string;
  slug: string;
  provinces: ProvinceData[];
};

function RegionColumn({ region }: { region: RegionData }) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_LIMIT = 7;
  const hasMore = region.provinces.length > INITIAL_LIMIT;
  const visibleProvinces = expanded
    ? region.provinces
    : region.provinces.slice(0, INITIAL_LIMIT);
  const remainingCount = region.provinces.length - INITIAL_LIMIT;
  const tone = regionTone(region.slug);

  return (
    <div className="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-2xs transition hover:border-primary/40">
      <div>
        <div className="flex items-center justify-between border-b pb-2.5 mb-3">
          <Link
            href={`/search?vung=${region.slug}`}
            className="flex items-center gap-2 font-semibold text-sm text-foreground hover:text-primary transition"
          >
            <span className={cn("size-2 rounded-full", tone.dot)} aria-hidden />
            <span>{region.name}</span>
          </Link>
          <Link
            href={`/search?vung=${region.slug}`}
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium transition",
              tone.bg,
              tone.text,
              "hover:opacity-85"
            )}
          >
            Xem tất cả
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {visibleProvinces.map((prov) => (
            <Link
              key={prov.id}
              href={`/search?tinh=${prov.slug}`}
              className="inline-flex items-center rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <span>{prov.name}</span>
              {prov._count.products > 0 && (
                <span className="ml-1 text-[10px] text-primary font-medium">
                  ({prov._count.products})
                </span>
              )}
            </Link>
          ))}

          {hasMore && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-0.5 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10 transition cursor-pointer"
            >
              <span>+{remainingCount} tỉnh</span>
              <ChevronDown className="size-3" aria-hidden />
            </button>
          )}

          {hasMore && expanded && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-0.5 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <span>Thu gọn</span>
              <ChevronUp className="size-3" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RegionBrowser({ regions }: { regions: RegionData[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {regions.map((region) => (
        <RegionColumn key={region.id} region={region} />
      ))}
    </div>
  );
}
