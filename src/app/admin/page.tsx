import Link from "next/link";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  title: "Tổng quan quản trị — Phố Đặc Sản Admin",
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
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan hệ thống"
        description="Theo dõi hoạt động của người dùng, gian hàng, sản phẩm và đơn hàng trên toàn sàn."
        actions={
          <Button size="sm" variant="outline" render={<Link href="/admin/gian-hang?status=PENDING" />}>
            <Clock className="size-3.5 mr-1.5" />
            Duyệt gian hàng ({shopStats.PENDING})
          </Button>
        }
      />

      {/* KPI row: 4 StatCards */}
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

      {/* 2/3 + 1/3 Grid: Breakdown charts left, latest pending shops right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: 2/3 width Shop & Order status breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shops breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Gian hàng theo trạng thái</CardTitle>
                  <CardDescription>Tình trạng kiểm duyệt và hoạt động của các đối tác</CardDescription>
                </div>
                <Button variant="ghost" size="sm" render={<Link href="/admin/gian-hang" />}>
                  Xem tất cả
                  <ArrowRight className="size-3.5 ml-1" />
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
            <CardHeader className="pb-3">
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

        {/* Right: 1/3 width Latest pending shops */}
        <div className="lg:col-span-1 rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Shop chờ duyệt</h2>
              <p className="text-xs text-muted-foreground">{shopStats.PENDING} hồ sơ đang đợi</p>
            </div>
            {latestPendingShops.length > 0 && (
              <Button size="xs" variant="outline" render={<Link href="/admin/gian-hang?status=PENDING" />}>
                Xem tất cả
              </Button>
            )}
          </div>

          {latestPendingShops.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Không có gian hàng nào đang chờ duyệt.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {latestPendingShops.map((shop) => (
                <div key={shop.id} className="p-3 space-y-2 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">{shop.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
                      {shop.plan}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{shop.owner.name}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      {shop.province.name}
                    </span>
                  </div>
                  <Button
                    size="xs"
                    className="w-full text-xs"
                    render={<Link href={`/admin/gian-hang?status=PENDING&q=${encodeURIComponent(shop.name)}`} />}
                  >
                    Kiểm duyệt hồ sơ
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tables: Full width pending shops table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Hồ sơ gian hàng mới đăng ký</h2>
            <p className="text-xs text-muted-foreground">Danh sách đối tác cần Ban quản trị xác minh nguồn gốc và phê duyệt</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/admin/gian-hang" />}
          >
            Quản lý tất cả gian hàng <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>

        {latestPendingShops.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Hiện không có gian hàng nào đang chờ duyệt. Tất cả hồ sơ đã được xử lý!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
                <TableRow className="h-11">
                  <TableHead>Gian hàng</TableHead>
                  <TableHead>Chủ sở hữu</TableHead>
                  <TableHead>Tỉnh thành</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestPendingShops.map((shop) => (
                  <TableRow key={shop.id} className="h-11">
                    <TableCell className="font-semibold text-sm text-foreground">
                      {shop.name}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium text-foreground">{shop.owner.name}</span>
                      <span className="text-muted-foreground ml-1">({shop.phone})</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-primary" />
                        {shop.province.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {shop.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(shop.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="xs"
                        render={<Link href={`/admin/gian-hang?status=PENDING&q=${encodeURIComponent(shop.name)}`} />}
                      >
                        Kiểm duyệt ngay
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
