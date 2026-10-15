import Link from "next/link";
import { Search, Flag, ExternalLink, ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Price } from "@/components/common/price";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
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
import { getSellerOrders } from "@/server/seller/orders";

export const metadata = {
  title: "Quản lý đơn hàng",
};

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    sort?: "asc" | "desc";
    page?: string;
  }>;
}

export default async function SellerOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const status = params.status || "";
  const search = params.search || "";
  const sort = params.sort === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(params.page) || 1);

  const { items, totalPages, currentPage, counts } = await getSellerOrders({
    status,
    search,
    sort,
    page,
    pageSize: 15,
  });

  const tabs = [
    { key: "", label: "Tất cả", count: counts.ALL },
    { key: "NEW", label: "Mới", count: counts.NEW },
    { key: "CONFIRMED", label: "Đã xác nhận", count: counts.CONFIRMED },
    { key: "SHIPPING", label: "Đang giao", count: counts.SHIPPING },
    { key: "COMPLETED", label: "Hoàn thành", count: counts.COMPLETED },
    { key: "CANCELLED", label: "Đã hủy", count: counts.CANCELLED },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đơn hàng"
        description="Gọi điện xác nhận với khách hàng, cập nhật lộ trình giao hàng và xử lý đơn"
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((t) => {
          const isActive = status === t.key;
          const queryParams = new URLSearchParams();
          if (t.key) queryParams.set("status", t.key);
          if (search) queryParams.set("search", search);
          if (sort !== "desc") queryParams.set("sort", sort);
          const href = `/kenh-ban/don-hang${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

          return (
            <Button
              key={t.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="gap-2"
              render={<Link href={href} />}
            >
              <span>{t.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[11px] font-mono ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form method="GET" className="relative w-full sm:w-80">
          {status && <input type="hidden" name="status" value={status} />}
          {sort !== "desc" && <input type="hidden" name="sort" value={sort} />}
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Tìm theo mã đơn, SĐT hoặc tên khách..."
            className="h-8 pl-8 text-xs"
          />
        </form>

        {/* Sort button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            className="gap-1 text-xs"
            render={
              <Link
                href={`/kenh-ban/don-hang?status=${status}&search=${encodeURIComponent(search)}&sort=${sort === "asc" ? "desc" : "asc"}`}
              />
            }
          >
            <ArrowUpDown className="size-3" />
            <span>Ngày đặt: {sort === "asc" ? "Cũ nhất trước" : "Mới nhất trước"}</span>
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[130px]">Mã đơn</TableHead>
              <TableHead className="min-w-[130px]">Thời gian</TableHead>
              <TableHead className="min-w-[180px]">Khách hàng</TableHead>
              <TableHead className="text-center">Số món</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="min-w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-16 text-center">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  Không tìm thấy đơn hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-semibold">
                    <Link
                      href={`/kenh-ban/don-hang/${o.code}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {o.code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</div>
                    <div className="font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{o.customerName}</span>
                      {o.hasCustomerFlag && (
                        <span
                          title="Số điện thoại này đã bị đánh dấu bom hàng"
                          className="inline-flex items-center text-destructive"
                        >
                          <Flag className="size-3.5 fill-destructive text-destructive" />
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground block">
                      {o.customerPhone}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums">
                    {o.itemCount} món
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    <Price amount={o.total} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-center p-2">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={<Link href={`/kenh-ban/don-hang/${o.code}`} />}
                      aria-label="Xem chi tiết đơn hàng"
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
                  href={`/kenh-ban/don-hang?page=${currentPage - 1}${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}&sort=${sort}`}
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
                      href={`/kenh-ban/don-hang?page=${pageNumber}${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}&sort=${sort}`}
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
                  href={`/kenh-ban/don-hang?page=${currentPage + 1}${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}&sort=${sort}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
