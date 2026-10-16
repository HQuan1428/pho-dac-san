import Link from "next/link";
import { SearchX } from "lucide-react";
import { searchProducts, type SearchParams } from "@/server/store/catalog";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/common/empty-state";
import { SearchFilters, SortSelector, ActiveFilterChips } from "@/components/store/search-filters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata = {
  title: "Tìm kiếm đặc sản — Phố Đặc Sản",
  description: "Tìm kiếm các loại đặc sản chính gốc theo vùng miền, tỉnh thành và khoảng giá.",
};

export default async function TimKiemPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { products, total, totalPages, currentPage, categories, regions } =
    await searchProducts(params);

  const q = params.q?.trim() || "";
  const currentSort = params["sap-xep"] || "moi-nhat";

  const createPageUrl = (pageNumber: number) => {
    const urlParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") {
        urlParams.set(k, v);
      }
    }
    urlParams.set("page", String(pageNumber));
    return `/search?${urlParams.toString()}`;
  };

  return (
    <div className="container-page py-6 md:py-8 space-y-5">
      {/* Header bar */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {q ? `Kết quả tìm kiếm cho "${q}"` : "Khám phá đặc sản"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tìm thấy <strong className="text-foreground">{total}</strong> sản phẩm đặc sản chính gốc
          </p>
        </div>
      </div>

      {/* Main layout: 260px Sticky Filter Sidebar + Results Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: 260px Sticky Filter Sidebar */}
        <SearchFilters categories={categories} regions={regions} />

        {/* Right: Results Area */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Active Filter Chips */}
          <ActiveFilterChips categories={categories} regions={regions} />

          {/* Toolbar row: Result count left, Sort select right */}
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3.5 py-2 shadow-xs">
            <div className="text-xs text-muted-foreground">
              Hiển thị <span className="font-semibold text-foreground">{products.length}</span> / {total} sản phẩm
            </div>
            <SortSelector currentSort={currentSort} />
          </div>

          {/* Product Grid (4 cols lg / 5 cols xl) or Empty State */}
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card p-10 text-center">
              <EmptyState
                icon={SearchX}
                title="Không tìm thấy đặc sản phù hợp"
                description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn."
              />
              <div className="mt-4">
                <Link
                  href="/search"
                  className="inline-flex h-8 items-center justify-center rounded-md border bg-background px-4 text-xs font-medium hover:bg-muted transition"
                >
                  Xóa bộ lọc và xem tất cả
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.href} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={createPageUrl(currentPage - 1)}
                        text="Trước"
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    const isNear = Math.abs(p - currentPage) <= 1;
                    const isEnd = p === 1 || p === totalPages;

                    if (!isNear && !isEnd) {
                      if (p === 2 || p === totalPages - 1) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }

                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href={createPageUrl(p)}
                          isActive={isCurrent}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href={createPageUrl(currentPage + 1)}
                        text="Sau"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
