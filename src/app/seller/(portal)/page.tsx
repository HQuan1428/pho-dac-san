import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  PackageOpen,
  Users,
  Calendar,
  ArrowRight,
  ExternalLink,
  Edit,
} from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Price, formatVnd } from "@/components/common/price";
import { RatingStars } from "@/components/common/rating-stars";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSellerDashboardData } from "@/server/seller/dashboard";
import { OrdersChart } from "@/components/seller/orders-chart";

export const metadata = {
  title: "Tổng quan gian hàng",
};

export default async function SellerDashboardPage() {
  const { stats, chartData, topProducts, latestNewOrders } =
    await getSellerDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan kinh doanh"
        description="Theo dõi hoạt động đặt hàng, doanh thu và sản phẩm nổi bật của gian hàng"
        actions={
          <Button
            size="sm"
            variant="default"
            render={<Link href="/seller/products/new" />}
          >
            + Thêm sản phẩm mới
          </Button>
        }
      />

      {/* KPI row: 5 StatCards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Đơn hàng mới"
          value={String(stats.newOrders)}
          icon={ShoppingBag}
        />
        <StatCard
          label="Đơn trong tháng"
          value={String(stats.ordersThisMonth)}
          delta={stats.ordersDelta}
          icon={Calendar}
        />
        <StatCard
          label="Doanh thu ước tính"
          value={formatVnd(stats.estimatedRevenue)}
          delta={stats.revenueDelta}
          icon={TrendingUp}
        />
        <StatCard
          label="Tổng sản phẩm"
          value={String(stats.productsCount)}
          icon={PackageOpen}
        />
        <StatCard
          label="Lượt theo dõi"
          value={String(stats.followersCount)}
          icon={Users}
        />
      </div>

      {/* 2/3 + 1/3 Grid: Chart on the left, Latest orders on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: 2/3 width Orders Chart */}
        <div className="lg:col-span-2">
          <OrdersChart data={chartData} />
        </div>

        {/* Right: 1/3 width Latest Orders */}
        <div className="lg:col-span-1 rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Đơn mới chờ gọi</h2>
              <p className="text-xs text-muted-foreground">5 đơn mới nhất cần xác nhận</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/seller/orders?status=NEW" />}
            >
              Xem tất cả <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>

          {latestNewOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Hiện không có đơn hàng mới nào cần xử lý.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {latestNewOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/seller/orders/${o.code}`}
                        className="font-mono text-xs font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {o.code}
                      </Link>
                      <Price amount={o.total} className="text-xs font-medium text-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.customerName} · <span className="font-mono">{o.customerPhone}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    render={<Link href={`/seller/orders/${o.code}`} />}
                    aria-label="Xem chi tiết"
                  >
                    <ExternalLink className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tables: Top products full width table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Top sản phẩm bán chạy</h2>
            <p className="text-xs text-muted-foreground">Thống kê sản phẩm theo tổng số lượng đã bán</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/seller/products" />}
          >
            Xem tất cả sản phẩm <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>

        {topProducts.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">
            Chưa có sản phẩm nào có lượt bán.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
                <TableRow className="h-11">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="w-16">Ảnh</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Giá bán</TableHead>
                  <TableHead className="text-right">Đã bán</TableHead>
                  <TableHead className="text-right">Đánh giá</TableHead>
                  <TableHead className="w-16 text-center">Sửa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p, idx) => (
                  <TableRow key={p.id} className="h-11">
                    <TableCell className="text-center font-mono text-xs font-semibold text-muted-foreground">
                      #{idx + 1}
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="relative size-9 overflow-hidden rounded-md border bg-muted">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[9px] text-muted-foreground">
                            Ảnh
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/seller/products/${p.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors text-sm line-clamp-1"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.categoryName}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      <Price amount={p.minPrice} />
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm text-primary tabular-nums">
                      {p.soldCount}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.ratingAvg > 0 ? (
                        <div className="inline-flex justify-end">
                          <RatingStars value={p.ratingAvg} count={0} compact />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center p-2">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        render={<Link href={`/seller/products/${p.id}`} />}
                        aria-label="Chỉnh sửa sản phẩm"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
