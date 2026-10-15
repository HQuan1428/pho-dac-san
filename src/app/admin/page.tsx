import Link from "next/link";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

export const metadata = {
  title: "Tổng quan quản trị — Phố Đặc Sản",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    userCount,
    shopCountsByStatus,
    productCount,
    ordersLast30Days,
    orderCountsByStatus,
    latestPendingShops,
  ] = await Promise.all([
    db.user.count(),
    db.shop.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    db.product.count(),
    db.order.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    db.shop.findMany({
      where: { status: "PENDING" },
      include: {
        owner: true,
        province: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const shopStats = {
    PENDING: 0,
    ACTIVE: 0,
    REJECTED: 0,
    SUSPENDED: 0,
  };
  for (const item of shopCountsByStatus) {
    shopStats[item.status] = item._count.id;
  }

  const orderStats: Record<string, number> = {
    NEW: 0,
    CONFIRMED: 0,
    SHIPPING: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const item of orderCountsByStatus) {
    orderStats[item.status] = item._count.id;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tổng quan hệ thống"
        description="Theo dõi hoạt động của người dùng, gian hàng, sản phẩm và đơn hàng trên toàn sàn."
        actions={
          <Button variant="outline" render={<Link href="/admin/gian-hang?status=PENDING" />}>
            <Clock data-icon="inline-start" />
            Duyệt gian hàng ({shopStats.PENDING})
          </Button>
        }
      />

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tổng người dùng"
          value={userCount.toLocaleString("vi-VN")}
          icon={Users}
        />
        <StatCard
          label="Gian hàng hoạt động"
          value={shopStats.ACTIVE.toLocaleString("vi-VN")}
          icon={Store}
        />
        <StatCard
          label="Tổng sản phẩm"
          value={productCount.toLocaleString("vi-VN")}
          icon={Package}
        />
        <StatCard
          label="Đơn hàng (30 ngày)"
          value={ordersLast30Days.toLocaleString("vi-VN")}
          icon={ShoppingBag}
        />
      </div>

      {/* Shops & Orders by status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Shops breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Gian hàng theo trạng thái</CardTitle>
                <CardDescription>Tình trạng kiểm duyệt và hoạt động của các đối tác</CardDescription>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/admin/gian-hang" />}>
                Xem tất cả
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <span className="flex justify-center text-warning">
                  <Clock className="size-5" />
                </span>
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{shopStats.PENDING}</p>
                <p className="text-xs text-muted-foreground">Chờ duyệt</p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <span className="flex justify-center text-success">
                  <CheckCircle className="size-5" />
                </span>
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{shopStats.ACTIVE}</p>
                <p className="text-xs text-muted-foreground">Hoạt động</p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <span className="flex justify-center text-destructive">
                  <XCircle className="size-5" />
                </span>
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{shopStats.REJECTED}</p>
                <p className="text-xs text-muted-foreground">Bị từ chối</p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3 text-center">
                <span className="flex justify-center text-muted-foreground">
                  <AlertCircle className="size-5" />
                </span>
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{shopStats.SUSPENDED}</p>
                <p className="text-xs text-muted-foreground">Tạm đình chỉ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Đơn hàng theo trạng thái</CardTitle>
            <CardDescription>Phân loại tiến độ xử lý đơn hàng của các gian hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg border bg-muted/20 p-2.5 text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">{orderStats.NEW}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Mới</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-2.5 text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">{orderStats.CONFIRMED}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Đã xác nhận</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-2.5 text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">{orderStats.SHIPPING}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Đang giao</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-2.5 text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">{orderStats.COMPLETED}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Hoàn thành</p>
              </div>
              <div className="rounded-lg border bg-muted/20 p-2.5 text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">{orderStats.CANCELLED}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Đã hủy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest pending shops list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Gian hàng chờ duyệt mới nhất</CardTitle>
              <CardDescription>
                Các đối tác vừa đăng ký cần Ban quản trị xác minh nguồn gốc và phê duyệt
              </CardDescription>
            </div>
            {latestPendingShops.length > 0 && (
              <Button size="sm" render={<Link href="/admin/gian-hang?status=PENDING" />}>
                Xử lý hồ sơ
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {latestPendingShops.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Không có gian hàng nào đang chờ duyệt. Tất cả hồ sơ đã được xử lý!
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {latestPendingShops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-muted/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{shop.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {shop.plan}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                        Chờ duyệt
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Chủ shop: <strong className="text-foreground">{shop.owner.name}</strong> ({shop.owner.email})</span>
                      <span>SĐT: {shop.phone}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-primary" />
                        {shop.province.name}
                      </span>
                    </div>
                  </div>

                  <Button size="sm" render={<Link href="/admin/gian-hang?status=PENDING" />}>
                    Kiểm duyệt ngay
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
