"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Banknote,
  Check,
  ChevronDown,
  Layers,
  MapPin,
  MapPinned,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatVnd } from "@/components/common/price";
import { getCategoryImageUrl } from "@/components/store/category-image";
import { regionTone, SORT_OPTIONS } from "@/lib/ui-icons";
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

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: "Dưới 100k", max: 100000 },
  { label: "100k - 300k", min: 100000, max: 300000 },
  { label: "300k - 500k", min: 300000, max: 500000 },
  { label: "Trên 500k", min: 500000 },
];

/**
 * (a) Horizontally scrollable row of category chips with round category images
 * Active chip is ringed in primary. Clicking active chip toggles off.
 */
export function CategoryChipsRow({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("danh-muc") || "";

  const createUrl = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (!slug) {
      params.delete("danh-muc");
    } else {
      params.set("danh-muc", slug);
    }
    return `/search?${params.toString()}`;
  };

  const handleSelect = (slug: string | null) => {
    router.push(createUrl(slug));
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
        {/* "Tất cả" chip */}
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs",
            !currentCategory
              ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Layers className="size-3" aria-hidden />
          </span>
          <span>Tất cả</span>
        </button>

        {/* Category chips */}
        {categories.map((c) => {
          const isSelected = currentCategory === c.slug;
          const imageUrl = getCategoryImageUrl(c.slug);

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(isSelected ? null : c.slug)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs",
                isSelected
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background font-semibold"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden
                  className={cn(
                    "size-5 rounded-full object-cover shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isSelected && "ring-1 ring-primary"
                  )}
                  loading="lazy"
                />
              ) : (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                  {c.name.slice(0, 1)}
                </span>
              )}
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * (b) Filter bar of icon chips that each open a Popover in place:
 * - Vùng miền (MapPinned; options colored with regionTone)
 * - Tỉnh (MapPin; searchable list)
 * - Giá (Banknote; min/max inputs + presets)
 * - Sắp xếp (ArrowUpDown; SORT_OPTIONS with their icons)
 */
export function FilterBar({
  regions,
}: {
  categories?: CategoryItem[];
  regions: RegionItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRegion = searchParams.get("vung") || "";
  const currentProvince = searchParams.get("tinh") || "";
  const currentGiaTu = searchParams.get("gia-tu") || "";
  const currentGiaDen = searchParams.get("gia-den") || "";
  const currentSort = searchParams.get("sap-xep") || "moi-nhat";

  // Popover open states
  const [openRegion, setOpenRegion] = useState(false);
  const [openProvince, setOpenProvince] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  // Local state for price inputs
  const [giaTu, setGiaTu] = useState(currentGiaTu);
  const [giaDen, setGiaDen] = useState(currentGiaDen);

  // Local search query for provinces
  const [provinceSearch, setProvinceSearch] = useState("");

  // Helper to build url with parameter overrides
  const pushFilter = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    for (const [key, val] of Object.entries(overrides)) {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    router.push(`/search?${params.toString()}`);
  };

  // Label resolvers
  const activeRegionObj = regions.find((r) => r.slug === currentRegion);

  const allProvinces = useMemo(() => {
    const list: { id: string; name: string; slug: string; regionSlug: string; regionName: string }[] = [];
    for (const r of regions) {
      for (const p of r.provinces) {
        list.push({ ...p, regionSlug: r.slug, regionName: r.name });
      }
    }
    return list;
  }, [regions]);

  const activeProvinceObj = allProvinces.find((p) => p.slug === currentProvince);

  const filteredProvinces = useMemo(() => {
    let list = allProvinces;
    if (currentRegion) {
      list = list.filter((p) => p.regionSlug === currentRegion);
    }
    if (!provinceSearch.trim()) return list;
    const q = provinceSearch.trim().toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [allProvinces, currentRegion, provinceSearch]);

  const activeSortObj = SORT_OPTIONS.find((s) => s.value === currentSort) || SORT_OPTIONS[0];

  const hasPrice = Boolean(currentGiaTu || currentGiaDen);
  let priceLabel = "Khoảng giá";
  if (currentGiaTu && currentGiaDen) {
    priceLabel = `${formatVnd(Number(currentGiaTu))} - ${formatVnd(Number(currentGiaDen))}`;
  } else if (currentGiaTu) {
    priceLabel = `Từ ${formatVnd(Number(currentGiaTu))}`;
  } else if (currentGiaDen) {
    priceLabel = `Đến ${formatVnd(Number(currentGiaDen))}`;
  }

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushFilter({
      "gia-tu": giaTu.trim() ? giaTu.trim() : null,
      "gia-den": giaDen.trim() ? giaDen.trim() : null,
    });
    setOpenPrice(false);
  };

  const applyPreset = (min?: number, max?: number) => {
    const newTu = min !== undefined ? String(min) : "";
    const newDen = max !== undefined ? String(max) : "";
    setGiaTu(newTu);
    setGiaDen(newDen);
    pushFilter({
      "gia-tu": newTu || null,
      "gia-den": newDen || null,
    });
    setOpenPrice(false);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
      {/* 1. VÙNG MIỀN POPOVER */}
      <Popover open={openRegion} onOpenChange={setOpenRegion}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-full px-3 text-xs shrink-0 cursor-pointer shadow-2xs transition",
                currentRegion &&
                  "border-primary/50 bg-primary/10 text-primary font-medium"
              )}
            />
          }
        >
          <MapPinned className="size-3.5" aria-hidden />
          <span>{activeRegionObj ? activeRegionObj.name : "Vùng miền"}</span>
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-64 max-w-[calc(100vw-2rem)] p-2 space-y-1"
        >
          <PopoverTitle className="sr-only">Lọc theo Vùng miền</PopoverTitle>
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Chọn vùng miền
          </div>

          <button
            type="button"
            onClick={() => {
              pushFilter({ vung: null, tinh: null });
              setOpenRegion(false);
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition hover:bg-muted cursor-pointer",
              !currentRegion ? "bg-muted font-medium text-primary" : "text-foreground"
            )}
          >
            <span>Tất cả vùng miền</span>
            {!currentRegion && <Check className="size-3.5 text-primary" />}
          </button>

          {regions.map((r) => {
            const isSelected = currentRegion === r.slug;
            const tone = regionTone(r.slug);

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  pushFilter({
                    vung: isSelected ? null : r.slug,
                    tinh: null,
                  });
                  setOpenRegion(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition cursor-pointer",
                  tone.bg,
                  tone.text,
                  isSelected ? "ring-1 ring-current font-semibold" : "hover:opacity-85"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", tone.dot)} aria-hidden />
                  <span>{r.name}</span>
                </span>
                {isSelected && <Check className="size-3.5" />}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>

      {/* 2. TỈNH THÀNH POPOVER (SEARCHABLE) */}
      <Popover open={openProvince} onOpenChange={setOpenProvince}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-full px-3 text-xs shrink-0 cursor-pointer shadow-2xs transition",
                currentProvince &&
                  "border-primary/50 bg-primary/10 text-primary font-medium"
              )}
            />
          }
        >
          <MapPin className="size-3.5" aria-hidden />
          <span className="max-w-[120px] truncate">
            {activeProvinceObj ? activeProvinceObj.name : "Tỉnh thành"}
          </span>
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 max-w-[calc(100vw-2rem)] p-2 space-y-2"
        >
          <PopoverTitle className="sr-only">Lọc theo Tỉnh thành</PopoverTitle>
          <div className="px-2 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Chọn tỉnh thành</span>
            {currentRegion && (
              <span className="text-[10px] lowercase text-primary font-normal">
                ({activeRegionObj?.name})
              </span>
            )}
          </div>

          {/* Searchable input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="text"
              placeholder="Tìm kiếm tỉnh thành..."
              value={provinceSearch}
              onChange={(e) => setProvinceSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="max-h-56 overflow-y-auto pr-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                pushFilter({ tinh: null });
                setOpenProvince(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition hover:bg-muted cursor-pointer",
                !currentProvince ? "bg-muted font-medium text-primary" : "text-muted-foreground"
              )}
            >
              <span>Tất cả tỉnh thành</span>
              {!currentProvince && <Check className="size-3.5 text-primary" />}
            </button>

            {filteredProvinces.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Không tìm thấy tỉnh thành
              </p>
            ) : (
              filteredProvinces.map((p) => {
                const isSelected = currentProvince === p.slug;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      pushFilter({
                        tinh: isSelected ? null : p.slug,
                        vung: p.regionSlug,
                      });
                      setOpenProvince(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition hover:bg-muted cursor-pointer",
                      isSelected ? "bg-primary/10 font-medium text-primary" : "text-foreground"
                    )}
                  >
                    <span>{p.name}</span>
                    {isSelected && <Check className="size-3.5 text-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* 3. KHOẢNG GIÁ POPOVER (PRESETS + MIN/MAX) */}
      <Popover open={openPrice} onOpenChange={setOpenPrice}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-full px-3 text-xs shrink-0 cursor-pointer shadow-2xs transition",
                hasPrice &&
                  "border-primary/50 bg-primary/10 text-primary font-medium"
              )}
            />
          }
        >
          <Banknote className="size-3.5" aria-hidden />
          <span className="max-w-[140px] truncate">{priceLabel}</span>
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 max-w-[calc(100vw-2rem)] p-3 space-y-3"
        >
          <PopoverTitle className="sr-only">Lọc theo khoảng giá</PopoverTitle>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Khoảng giá (VND)
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-2 gap-1.5">
            {PRICE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => applyPreset(preset.min, preset.max)}
                className="text-[11px] justify-center h-7"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom min/max inputs */}
          <form onSubmit={handlePriceSubmit} className="space-y-2.5 pt-1 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Từ (đ)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={giaTu}
                  onChange={(e) => setGiaTu(e.target.value)}
                  min={0}
                  step={1000}
                  className="h-8 text-xs px-2"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Đến (đ)</label>
                <Input
                  type="number"
                  placeholder="1.000.000"
                  value={giaDen}
                  onChange={(e) => setGiaDen(e.target.value)}
                  min={0}
                  step={1000}
                  className="h-8 text-xs px-2"
                />
              </div>
            </div>

            {/* Exactly ONE solid primary green button */}
            <Button type="submit" size="xs" className="w-full h-8 text-xs">
              Áp dụng giá
            </Button>
          </form>
        </PopoverContent>
      </Popover>

      {/* 4. SẮP XẾP POPOVER */}
      <Popover open={openSort} onOpenChange={setOpenSort}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-full px-3 text-xs shrink-0 cursor-pointer shadow-2xs transition",
                currentSort !== "moi-nhat" &&
                  "border-primary/50 bg-primary/10 text-primary font-medium"
              )}
            />
          }
        >
          <ArrowUpDown className="size-3.5" aria-hidden />
          <span>{activeSortObj.label}</span>
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-56 max-w-[calc(100vw-2rem)] p-1.5 space-y-0.5"
        >
          <PopoverTitle className="sr-only">Sắp xếp sản phẩm</PopoverTitle>
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sắp xếp theo
          </div>

          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = currentSort === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  pushFilter({ "sap-xep": opt.value });
                  setOpenSort(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition hover:bg-muted cursor-pointer",
                  isSelected ? "bg-primary/10 font-medium text-primary" : "text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="size-3.5 text-primary" />}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * (c) Active filters show as removable chips (X icon) with a "Xoá tất cả" ghost button.
 */
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
      <span className="text-xs text-muted-foreground font-medium mr-1">
        Bộ lọc đang chọn:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary font-medium"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => removeFilter(chip.key)}
            className="rounded-full p-0.5 hover:bg-primary/20 transition cursor-pointer"
            aria-label={`Xóa bộ lọc ${chip.label}`}
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      {/* Ghost button "Xoá tất cả" */}
      <Button
        variant="ghost"
        size="xs"
        onClick={clearAll}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
      >
        Xoá tất cả
      </Button>
    </div>
  );
}

/**
 * Top SearchFilters component that replaces the sidebar filter:
 * Renders category chips row, icon chips popover filter bar, and active chips.
 */
export function SearchFilters({
  categories,
  regions,
}: {
  categories: CategoryItem[];
  regions: RegionItem[];
}) {
  return (
    <div className="w-full space-y-3">
      {/* (a) Category Chips */}
      <CategoryChipsRow categories={categories} />

      {/* (b) Popover Filter Bar */}
      <FilterBar categories={categories} regions={regions} />

      {/* (c) Active Filter Chips */}
      <ActiveFilterChips categories={categories} regions={regions} />
    </div>
  );
}

/**
 * Kept for backwards compatibility and external usages (e.g. shops/[slug]/page.tsx).
 * Uses SORT_OPTIONS from @/lib/ui-icons.
 */
export function SortSelector({
  currentSort = "moi-nhat",
}: {
  currentSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sap-xep", newSort);
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  const activeOption = SORT_OPTIONS.find((s) => s.value === currentSort) || SORT_OPTIONS[0];

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs cursor-pointer"
          />
        }
      >
        <span className="text-muted-foreground">Sắp xếp:</span>
        <span className="font-medium text-foreground">{activeOption.label}</span>
        <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <PopoverTitle className="sr-only">Tùy chọn sắp xếp</PopoverTitle>
        {SORT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentSort === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSortChange(opt.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition hover:bg-muted cursor-pointer",
                isSelected ? "bg-primary/10 font-medium text-primary" : "text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                <span>{opt.label}</span>
              </span>
              {isSelected && <Check className="size-3.5 text-primary" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
