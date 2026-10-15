import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Price } from "@/components/common/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getSellerProducts } from "@/server/seller/products";

export const metadata = {
  title: "Quản lý sản phẩm",
};

interface ProductListPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

const statusBadgeMap = {
  ACTIVE: { label: "Đang bán", className: "bg-primary/10 text-primary border-primary/20" },
  DRAFT: { label: "Bản nháp", className: "bg-muted text-muted-foreground border-border" },
  HIDDEN: { label: "Ẩn", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search || "";
  const status = params.status || "";

  const { items, total, totalPages, currentPage } = await getSellerProducts({
    page,
    search,
    status,
    pageSize: 10,
  });

  const statuses = [
    { value: "", label: "Tất cả" },
    { value: "ACTIVE", label: "Đang bán" },
    { value: "DRAFT", label: "Bản nháp" },
    { value: "HIDDEN", label: "Đã ẩn" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sản phẩm của gian hàng"
        description={`Tổng số ${total} sản phẩm đặc sản`}
        actions={
          <Button size="sm" className="gap-1.5" render={<Link href="/kenh-ban/san-pham/moi" />}>
            <Plus className="size-4" />
            Thêm sản phẩm mới
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => {
            const isActive = status === s.value;
            const queryParams = new URLSearchParams();
            if (s.value) queryParams.set("status", s.value);
            if (search) queryParams.set("search", search);
            const href = `/kenh-ban/san-pham${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

            return (
              <Button
                key={s.value}
                size="xs"
                variant={isActive ? "default" : "outline"}
                render={<Link href={href} />}
              >
                {s.label}
              </Button>
            );
          })}
        </div>

        {/* Search input form */}
        <form method="GET" className="relative w-full sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Tìm theo tên sản phẩm..."
            className="h-8 pl-8 text-xs"
          />
        </form>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Giá bán từ</TableHead>
              <TableHead className="text-right">Kho</TableHead>
              <TableHead className="text-right">Đã bán</TableHead>
              <TableHead className="w-16 text-center">Sửa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  Không tìm thấy sản phẩm nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => {
                const badgeInfo = statusBadgeMap[p.status];

                return (
                  <TableRow key={p.id}>
                    <TableCell className="p-2">
                      <div className="relative size-12 overflow-hidden rounded-md border bg-muted">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                            Không ảnh
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/kenh-ban/san-pham/${p.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors text-sm line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{p.categoryName}</span>
                        <span>·</span>
                        <span>{p.variantCount} phân loại</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badgeInfo.className}>
                        {badgeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      <Price amount={p.minPrice} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {p.totalStock}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-semibold text-primary">
                      {p.soldCount}
                    </TableCell>
                    <TableCell className="text-center p-2">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        render={<Link href={`/kenh-ban/san-pham/${p.id}`} />}
                        aria-label="Chỉnh sửa sản phẩm"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`/kenh-ban/san-pham?page=${currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}`}
                />
              </PaginationItem>
            )}

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={`/kenh-ban/san-pham?page=${pageNumber}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}`}
                      isActive={pageNumber === currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              return null;
            })}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href={`/kenh-ban/san-pham?page=${currentPage + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
