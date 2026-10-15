"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, RotateCcw, SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

type ProvinceItem = {
  id: string;
  name: string;
  slug: string;
};

type RegionItem = {
  id: string;
  name: string;
  slug: string;
  provinces: ProvinceItem[];
};

export function SearchFilters({
  categories,
  regions,
}: {
  categories: CategoryItem[];
  regions: RegionItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("danh-muc") || "";
  const currentRegion = searchParams.get("vung") || "";
  const currentProvince = searchParams.get("tinh") || "";
  const currentGiaTu = searchParams.get("gia-tu") || "";
  const currentGiaDen = searchParams.get("gia-den") || "";
  const currentQ = searchParams.get("q") || "";
  const currentSort = searchParams.get("sap-xep") || "moi-nhat";

  const [giaTu, setGiaTu] = useState(currentGiaTu);
  const [giaDen, setGiaDen] = useState(currentGiaDen);
  const [openMobile, setOpenMobile] = useState(false);

  const hasFilters = Boolean(
    currentCategory || currentRegion || currentProvince || currentGiaTu || currentGiaDen
  );

  const createFilterUrl = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset to page 1 on filter change

    for (const [key, val] of Object.entries(overrides)) {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    return `/tim-kiem?${params.toString()}`;
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const nextUrl = createFilterUrl({
      "gia-tu": giaTu.trim() ? giaTu.trim() : null,
      "gia-den": giaDen.trim() ? giaDen.trim() : null,
    });
    setOpenMobile(false);
    router.push(nextUrl);
  };

  const clearAllUrl = `/tim-kiem${currentQ ? `?q=${encodeURIComponent(currentQ)}` : ""}${currentSort !== "moi-nhat" ? `${currentQ ? "&" : "?"}sap-xep=${currentSort}` : ""}`;

  const FilterPanel = () => (
    <div className="space-y-6 text-sm">
      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Danh mục đặc sản</h3>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          <Link
            href={createFilterUrl({ "danh-muc": null })}
            onClick={() => setOpenMobile(false)}
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-1.5 transition hover:bg-muted",
              !currentCategory ? "bg-muted font-medium text-primary" : "text-muted-foreground"
            )}
          >
            <span>Tất cả danh mục</span>
            {!currentCategory && <Check className="size-4 text-primary" />}
          </Link>
          {categories.map((c) => {
            const isSelected = currentCategory === c.slug;
            return (
              <Link
                key={c.id}
                href={createFilterUrl({ "danh-muc": isSelected ? null : c.slug })}
                onClick={() => setOpenMobile(false)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 transition hover:bg-muted",
                  isSelected ? "bg-muted font-medium text-primary" : "text-muted-foreground"
                )}
              >
                <span>{c.name}</span>
                {isSelected && <Check className="size-4 text-primary" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Region & Province Filter */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-semibold text-foreground">Vùng miền & Tỉnh thành</h3>
        <div className="flex flex-col gap-2">
          {regions.map((region) => {
            const isRegionActive = currentRegion === region.slug;
            return (
              <div key={region.id} className="space-y-1">
                <Link
                  href={createFilterUrl({
                    vung: isRegionActive ? null : region.slug,
                    tinh: null,
                  })}
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2.5 py-1 font-medium transition hover:bg-muted",
                    isRegionActive && !currentProvince
                      ? "bg-muted text-primary"
                      : "text-foreground"
                  )}
                >
                  <span>{region.name}</span>
                  {isRegionActive && !currentProvince && <Check className="size-4 text-primary" />}
                </Link>

                <div className="ml-3 flex flex-wrap gap-1 border-l pl-2">
                  {region.provinces.map((p) => {
                    const isProvinceSelected = currentProvince === p.slug;
                    return (
                      <Link
                        key={p.id}
                        href={createFilterUrl({
                          tinh: isProvinceSelected ? null : p.slug,
                          vung: null,
                        })}
                        onClick={() => setOpenMobile(false)}
                        className={cn(
                          "rounded px-2 py-0.5 text-xs transition",
                          isProvinceSelected
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {p.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-semibold text-foreground">Khoảng giá (VND)</h3>
        <form onSubmit={handlePriceApply} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Từ (đ)"
              value={giaTu}
              onChange={(e) => setGiaTu(e.target.value)}
              min={0}
              step={1000}
              className="text-xs"
            />
            <Input
              type="number"
              placeholder="Đến (đ)"
              value={giaDen}
              onChange={(e) => setGiaDen(e.target.value)}
              min={0}
              step={1000}
              className="text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="w-full">
            Áp dụng giá
          </Button>
        </form>
      </div>

      {/* Reset Filter Button */}
      {hasFilters && (
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setGiaTu("");
              setGiaDen("");
              setOpenMobile(false);
              router.push(clearAllUrl);
            }}
          >
            <RotateCcw className="size-4" />
            <span>Xóa tất cả bộ lọc</span>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 rounded-lg border bg-card p-4 h-fit sticky top-20">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 font-medium">
            <Filter className="size-4 text-primary" />
            <span>Bộ lọc tìm kiếm</span>
          </div>
          {hasFilters && (
            <Link
              href={clearAllUrl}
              className="text-xs text-muted-foreground hover:text-primary transition"
            >
              Đặt lại
            </Link>
          )}
        </div>
        <FilterPanel />
      </aside>

      {/* Mobile Trigger Button and Sheet */}
      <div className="lg:hidden">
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
            <SlidersHorizontal className="size-4" />
            <span>Bộ lọc {hasFilters && "•"}</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto p-6">
            <SheetHeader className="mb-4">
              <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
            </SheetHeader>
            <FilterPanel />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function SortSelector({
  currentSort = "moi-nhat",
}: {
  currentSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortOptions = [
    { value: "moi-nhat", label: "Mới nhất" },
    { value: "ban-chay", label: "Bán chạy" },
    { value: "danh-gia", label: "Đánh giá cao" },
    { value: "gia-tang", label: "Giá tăng dần" },
    { value: "gia-giam", label: "Giá giảm dần" },
  ];

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sap-xep", newSort);
    params.delete("page");
    router.push(`/tim-kiem?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted-foreground sm:inline">Sắp xếp:</span>
      <div className="flex flex-wrap gap-1.5">
        {sortOptions.map((opt) => {
          const isSelected = currentSort === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSortChange(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
