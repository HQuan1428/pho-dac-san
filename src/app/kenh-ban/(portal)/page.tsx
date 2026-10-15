import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  PackageOpen,
  Users,
  Calendar,
  ArrowRight,
  ExternalLink,
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
            variant="outline"
            render={<Link href="/kenh-ban/san-pham/moi" />}
          >
            + Thêm sản phẩm mới
          </Button>
        }
      />

      {/* 5 StatCards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
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

      {/* 30-day orders bar chart */}
      <OrdersChart data={chartData} />

      {/* Two columns: Top products & Recent new orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Products by soldCount */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Top sản phẩm bán chạy</h2>
              <p className="text-xs text-muted-foreground">Theo tổng số lượng đã bán</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/kenh-ban/san-pham" />}
            >
              Xem tất cả <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>

          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Chưa có sản phẩm nào có lượt bán.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/30"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-mono font-semibold text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
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
                        Ảnh
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.categoryName}</span>
                      <span>·</span>
                      <Price amount={p.minPrice} className="text-xs" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary tabular-nums">
                      {p.soldCount} đã bán
                    </p>
                    {p.ratingAvg > 0 && (
                      <RatingStars value={p.ratingAvg} count={0} compact />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest 5 NEW orders */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Đơn hàng mới chờ gọi</h2>
              <p className="text-xs text-muted-foreground">5 đơn hàng mới nhất cần xác nhận</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/kenh-ban/don-hang?status=NEW" />}
            >
              Xem tất cả <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>

          {latestNewOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Hiện không có đơn hàng mới nào cần xử lý.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestNewOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        <Link
                          href={`/kenh-ban/don-hang/${o.code}`}
                          className="hover:text-primary hover:underline"
                        >
                          {o.code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-foreground">{o.customerName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{o.customerPhone}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Price amount={o.total} className="text-xs" />
                      </TableCell>
                      <TableCell className="text-center p-2">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={<Link href={`/kenh-ban/don-hang/${o.code}`} />}
                          aria-label="Xem chi tiết"
                        >
                          <ExternalLink className="size-3.5" />
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
    </div>
  );
}
