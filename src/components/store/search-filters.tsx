"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, RotateCcw, SlidersHorizontal, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatVnd } from "@/components/common/price";
import { cn } from "@/lib/utils";

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

export type ProvinceItem = {
  id: string;
  name: string;
  slug: string;
};

export type RegionItem = {
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
    return `/search?${params.toString()}`;
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
    <div className="space-y-5 text-sm">
      {/* Category Filter */}
      <div className="space-y-2.5">
        <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
          Danh mục đặc sản
        </h3>
        <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-1">
          <Link
            href={createFilterUrl({ "danh-muc": null })}
            onClick={() => setOpenMobile(false)}
            className={cn(
              "flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition hover:bg-muted",
              !currentCategory ? "bg-muted font-medium text-primary" : "text-muted-foreground"
            )}
          >
            <span>Tất cả danh mục</span>
            {!currentCategory && <Check className="size-3.5 text-primary" />}
          </Link>
          {categories.map((c) => {
            const isSelected = currentCategory === c.slug;
            return (
              <Link
                key={c.id}
                href={createFilterUrl({ "danh-muc": isSelected ? null : c.slug })}
                onClick={() => setOpenMobile(false)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition hover:bg-muted",
                  isSelected ? "bg-muted font-medium text-primary" : "text-muted-foreground"
                )}
              >
                <span className="truncate">{c.name}</span>
                {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-1" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Region & Province Filter */}
      <div className="space-y-2.5 border-t pt-4">
        <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
          Vùng miền & Tỉnh thành
        </h3>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
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
                    "flex items-center justify-between rounded-md px-2 py-1 text-xs font-medium transition hover:bg-muted",
                    isRegionActive && !currentProvince
                      ? "bg-muted text-primary"
                      : "text-foreground"
                  )}
                >
                  <span>{region.name}</span>
                  {isRegionActive && !currentProvince && <Check className="size-3.5 text-primary" />}
                </Link>

                <div className="ml-2 flex flex-wrap gap-1 border-l pl-2">
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
                          "rounded px-1.5 py-0.5 text-[11px] transition",
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
      <div className="space-y-2.5 border-t pt-4">
        <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
          Khoảng giá (VND)
        </h3>
        <form onSubmit={handlePriceApply} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Từ (đ)"
              value={giaTu}
              onChange={(e) => setGiaTu(e.target.value)}
              min={0}
              step={1000}
              className="h-8 text-xs px-2"
            />
            <Input
              type="number"
              placeholder="Đến (đ)"
              value={giaDen}
              onChange={(e) => setGiaDen(e.target.value)}
              min={0}
              step={1000}
              className="h-8 text-xs px-2"
            />
          </div>
          <Button type="submit" variant="secondary" size="xs" className="w-full h-8 text-xs">
            Áp dụng giá
          </Button>
        </form>
      </div>

      {/* Reset Filter Button */}
      {hasFilters && (
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            size="xs"
            className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setGiaTu("");
              setGiaDen("");
              setOpenMobile(false);
              router.push(clearAllUrl);
            }}
          >
            <RotateCcw className="size-3.5" />
            <span>Xóa tất cả bộ lọc</span>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 260px Sticky Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 rounded-lg border bg-card p-4 h-fit sticky top-20 shadow-xs">
        <div className="mb-3.5 flex items-center justify-between border-b pb-2.5">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Filter className="size-4 text-primary" />
            <span>Bộ lọc tìm kiếm</span>
          </div>
          {hasFilters && (
            <Link
              href={clearAllUrl}
              className="text-[11px] text-muted-foreground hover:text-primary transition"
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
          <SheetTrigger render={<Button variant="outline" size="sm" className="gap-2 text-xs" />}>
            <SlidersHorizontal className="size-3.5" />
            <span>Bộ lọc {hasFilters && "•"}</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto p-5">
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

export function ActiveFilterChips({
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

  // Look up labels
  const categoryObj = categories.find((c) => c.slug === currentCategory);
  const regionObj = regions.find((r) => r.slug === currentRegion);

  let provinceName = "";
  for (const r of regions) {
    const prov = r.provinces.find((p) => p.slug === currentProvince);
    if (prov) {
      provinceName = prov.name;
      break;
    }
  }

  type ActiveChip = {
    key: string;
    label: string;
  };

  const chips: ActiveChip[] = [];

  if (currentQ) {
    chips.push({ key: "q", label: `Từ khóa: "${currentQ}"` });
  }
  if (categoryObj) {
    chips.push({ key: "danh-muc", label: `Danh mục: ${categoryObj.name}` });
  }
  if (regionObj) {
    chips.push({ key: "vung", label: `Vùng: ${regionObj.name}` });
  }
  if (provinceName) {
    chips.push({ key: "tinh", label: `Tỉnh: ${provinceName}` });
  }
  if (currentGiaTu && currentGiaDen) {
    chips.push({
      key: "gia",
      label: `Giá: ${formatVnd(Number(currentGiaTu))} - ${formatVnd(Number(currentGiaDen))}`,
    });
  } else if (currentGiaTu) {
    chips.push({ key: "gia-tu", label: `Giá từ: ${formatVnd(Number(currentGiaTu))}` });
  } else if (currentGiaDen) {
    chips.push({ key: "gia-den", label: `Giá đến: ${formatVnd(Number(currentGiaDen))}` });
  }

  if (chips.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (key === "gia") {
      params.delete("gia-tu");
      params.delete("gia-den");
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sap-xep");
    if (sort && sort !== "moi-nhat") {
      params.set("sap-xep", sort);
    }
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-xs text-muted-foreground font-medium mr-1">Bộ lọc đang chọn:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs text-primary font-medium"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => removeFilter(chip.key)}
            className="rounded-full p-0.5 hover:bg-primary/20 transition cursor-pointer"
            aria-label={`Xóa bộ lọc ${chip.label}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-muted-foreground hover:text-destructive underline transition ml-1 cursor-pointer"
      >
        Xóa tất cả
      </button>
    </div>
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
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground whitespace-nowrap">Sắp xếp:</span>
      <Select
        value={currentSort}
        onValueChange={(val) => {
          if (val) handleSortChange(val);
        }}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent align="end">
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
