import Link from "next/link";
import { SearchX } from "lucide-react";
import { searchProducts, type SearchParams } from "@/server/store/catalog";
import { ProductCard } from "@/components/common/product-card";
import { EmptyState } from "@/components/common/empty-state";
import { SearchFilters, SortSelector } from "@/components/store/search-filters";
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
    return `/tim-kiem?${urlParams.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {q ? `Kết quả tìm kiếm cho "${q}"` : "Khám phá đặc sản"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tìm thấy <strong className="text-foreground">{total}</strong> sản phẩm phù hợp
          </p>
        </div>
      </div>

      {/* Main layout: Filters + Product Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Filter Sidebar (desktop) & Mobile Sheet */}
        <SearchFilters categories={categories} regions={regions} />

        {/* Right: Products Area */}
        <div className="flex-1 space-y-6">
          {/* Top Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-xs">
            <div className="text-xs text-muted-foreground">
              Hiển thị <span className="font-semibold text-foreground">{products.length}</span> / {total} sản phẩm
            </div>
            <SortSelector currentSort={currentSort} />
          </div>

          {/* Product Grid or Empty State */}
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-card p-12 text-center">
              <EmptyState
                icon={SearchX}
                title="Không tìm thấy đặc sản phù hợp"
                description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn."
              />
              <div className="mt-4">
                <Link
                  href="/tim-kiem"
                  className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-xs font-medium hover:bg-muted transition"
                >
                  Xóa bộ lọc và xem tất cả
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
                    // Show first, last, and pages around current
                    if (
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href={createPageUrl(p)}
                            isActive={p === currentPage}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (p === currentPage - 2 || p === currentPage + 2) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
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
