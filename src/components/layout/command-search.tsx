"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Store, Tag, X, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatVnd } from "@/components/common/price";
import { getCategoryImageUrl } from "@/components/store/category-image";
import type { SearchSuggestionResult } from "@/server/store/catalog";

const DEFAULT_FEATURED_CATEGORIES = [
  { id: "1", name: "Bánh kẹo", slug: "banh-keo" },
  { id: "2", name: "Trà & Cà phê", slug: "tra-ca-phe" },
  { id: "3", name: "Đồ khô & Hải sản khô", slug: "do-kho-hai-san-kho" },
  { id: "4", name: "Gia vị & Nước chấm", slug: "gia-vi-nuoc-cham" },
  { id: "5", name: "Trái cây & Rau củ", slug: "trai-cay-rau-cu" },
  { id: "6", name: "Gạo & Ngũ cốc", slug: "gao-ngu-coc" },
  { id: "7", name: "Rượu & Đồ uống", slug: "ruou-do-uong" },
  { id: "8", name: "Quà biếu", slug: "qua-bieu" },
];

let globalOpen = false;
const openListeners = new Set<(open: boolean) => void>();

export function setCommandSearchOpen(open: boolean) {
  globalOpen = open;
  openListeners.forEach((l) => l(open));
}

export function useCommandSearchOpen() {
  const [open, setOpen] = useState(globalOpen);
  useEffect(() => {
    const handler = (val: boolean) => setOpen(val);
    openListeners.add(handler);
    return () => {
      openListeners.delete(handler);
    };
  }, []);
  return [open, setCommandSearchOpen] as const;
}

type SuggestionItem =
  | { type: "product"; id: string; name: string; href: string; image: string; price: number; shopName: string }
  | { type: "shop"; id: string; name: string; href: string; logo?: string | null; province: string }
  | { type: "category"; id: string; name: string; slug: string; href: string; image?: string | null };

export function CommandSearch({
  featuredCategories = DEFAULT_FEATURED_CATEGORIES,
}: {
  featuredCategories?: { id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useCommandSearchOpen();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
  }, []);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandSearchOpen(!globalOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Reset state when opening/closing
  useEffect(() => {
    if (open) {
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
      setSelectedIndex(-1);
    }
  }, [open]);

  // Debounce search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search-suggest?q=${encodeURIComponent(trimmed)}`);
          if (res.ok) {
            const data: SearchSuggestionResult = await res.json();
            setResults(data);
            setSelectedIndex(-1);
          }
        } catch (err) {
          console.error("Search suggestion error:", err);
        } finally {
          setIsLoading(false);
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Build flattened selectable items list for keyboard navigation
  const flattenedItems: SuggestionItem[] = [];
  if (results) {
    results.products.forEach((p) => flattenedItems.push({ type: "product", ...p }));
    results.shops.forEach((s) => flattenedItems.push({ type: "shop", ...s }));
    results.categories.forEach((c) => flattenedItems.push({ type: "category", ...c }));
  }

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flattenedItems.length > 0) {
        setSelectedIndex((prev) => (prev < flattenedItems.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flattenedItems.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flattenedItems.length - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flattenedItems.length) {
        navigateTo(flattenedItems[selectedIndex].href);
      } else if (query.trim()) {
        navigateTo(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hasResults =
    results &&
    (results.products.length > 0 || results.shops.length > 0 || results.categories.length > 0);

  let currentIndexTracker = 0;

  return (
    <>
      <div className="relative ml-auto hidden w-full max-w-xs sm:block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Tìm đặc sản, gian hàng (Ctrl+K)"
          className="flex h-9 w-full items-center gap-2 rounded-md border border-black/10 bg-white/50 px-3 text-sm text-muted-foreground backdrop-blur-md transition-colors hover:border-ring/50 hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:hover:border-white/25"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="flex-1 text-left text-sm text-muted-foreground truncate">
            Tìm đặc sản, gian hàng…
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-black/10 bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground dark:border-white/15">
            <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
          </kbd>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          mobileSheet
          showCloseButton={false}
          className="sm:max-w-xl p-0 gap-0 overflow-hidden shadow-2xl"
        >
          <DialogTitle className="sr-only">Tìm kiếm đặc sản</DialogTitle>

          {/* Search Input Bar */}
          <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm đặc sản, gian hàng, danh mục…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {isLoading || isPending ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Xóa nội dung tìm kiếm"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <kbd className="hidden select-none rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
                ESC
              </kbd>
            )}
          </div>

          {/* Results / Empty State Container */}
          <div className="max-h-[60vh] overflow-y-auto p-3 overscroll-contain">
            {/* Empty Query: Featured Categories */}
            {!query.trim() && (
              <div className="space-y-3 p-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Danh mục nổi bật
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuredCategories.map((cat) => {
                    const imgUrl = getCategoryImageUrl(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => navigateTo(`/search?danh-muc=${cat.slug}`)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary dark:border-white/10"
                      >
                        {imgUrl ? (
                          <span className="relative size-4 overflow-hidden rounded-full">
                            <Image
                              src={imgUrl}
                              alt=""
                              fill
                              sizes="16px"
                              className="object-cover"
                              aria-hidden="true"
                            />
                          </span>
                        ) : (
                          <Tag className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Grouped */}
            {query.trim() && hasResults && (
              <div className="space-y-4">
                {/* 1. Sản phẩm */}
                {results.products.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sản phẩm
                    </div>
                    {results.products.map((product) => {
                      const itemIndex = currentIndexTracker++;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={product.id}
                          onClick={() => navigateTo(product.href)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                            isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/70"
                          }`}
                        >
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border/40 bg-muted">
                            <Image
                              src={product.image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{product.shopName}</div>
                          </div>
                          <div className="text-sm font-semibold tabular-nums text-primary shrink-0">
                            {formatVnd(product.price)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Gian hàng */}
                {results.shops.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gian hàng
                    </div>
                    {results.shops.map((shop) => {
                      const itemIndex = currentIndexTracker++;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={shop.id}
                          onClick={() => navigateTo(shop.href)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                            isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Store className="size-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{shop.name}</div>
                            <div className="text-xs text-muted-foreground">{shop.province}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Danh mục */}
                {results.categories.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Danh mục
                    </div>
                    {results.categories.map((category) => {
                      const itemIndex = currentIndexTracker++;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={category.id}
                          onClick={() => navigateTo(category.href)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                            isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground overflow-hidden">
                            {category.image ? (
                              <div className="relative size-full">
                                <Image
                                  src={category.image}
                                  alt=""
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                  aria-hidden="true"
                                />
                              </div>
                            ) : (
                              <Tag className="size-4" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 text-sm font-medium truncate">
                            {category.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {query.trim() && !isLoading && !isPending && !hasResults && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>Không tìm thấy kết quả nào cho &ldquo;{query}&rdquo;</p>
                <p className="mt-1 text-xs">Nhấn Enter để tìm kiếm toàn bộ sản phẩm trên hệ thống</p>
              </div>
            )}
          </div>

          {/* Footer Action */}
          {query.trim() && (
            <div className="border-t border-border/80 bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => navigateTo(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="flex w-full items-center justify-between font-medium text-primary hover:underline"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Search className="size-3.5 shrink-0" aria-hidden="true" />
                  Xem tất cả kết quả cho &ldquo;{query}&rdquo;
                </span>
                <span className="inline-flex items-center gap-1 shrink-0 text-muted-foreground font-normal">
                  Enter <ArrowRight className="size-3" aria-hidden="true" />
                </span>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
