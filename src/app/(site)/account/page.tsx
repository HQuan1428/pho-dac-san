import Link from "next/link";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { Price } from "@/components/common/price";
import { cn } from "@/lib/utils";
import { ChangePasswordForm } from "./change-password-form";
import { EmailVerificationBanner } from "./email-verification-banner";
import { ProfileForm } from "./profile-form";
import { OrdersPanel } from "./orders-panel";
import { WishlistPanel } from "./wishlist-panel";
import { AddressesPanel } from "./addresses-panel";
import { FollowingPanel } from "./following-panel";

export const metadata: Metadata = {
  title: "Tài khoản của tôi - Phố Đặc Sản",
};

const HUB_TABS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard, href: "/account" },
  { id: "orders", label: "Đơn hàng", icon: Package, href: "/account?tab=orders" },
  { id: "wishlist", label: "Yêu thích", icon: Heart, href: "/account?tab=wishlist" },
  { id: "addresses", label: "Sổ địa chỉ", icon: MapPin, href: "/account?tab=addresses" },
  { id: "following", label: "Gian hàng", icon: Store, href: "/account?tab=following" },
];

export default async function AccountPage(props: {
  searchParams: Promise<{ tab?: string; status?: string; verify?: string }>;
}) {
  const sessionUser = await requireUser("/account");
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab || "overview";

  return (
    <div className="space-y-6">
      {/* Icon tabs driven by ?tab= */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b pb-2.5 scrollbar-none">
        {HUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              scroll={false}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab Panels */}
      {currentTab === "orders" && (
        <OrdersPanel userId={sessionUser.id} currentStatus={searchParams.status} />
      )}

      {currentTab === "wishlist" && (
        <WishlistPanel userId={sessionUser.id} />
      )}

      {currentTab === "addresses" && (
        <AddressesPanel userId={sessionUser.id} />
      )}

      {currentTab === "following" && (
        <FollowingPanel userId={sessionUser.id} />
      )}

      {currentTab === "overview" && (
        <OverviewPanel sessionUserId={sessionUser.id} verify={searchParams.verify} />
      )}
    </div>
  );
}

async function OverviewPanel({
  sessionUserId,
  verify,
}: {
  sessionUserId: string;
  verify?: string;
}) {
  const [
    user,
    newOrdersCount,
    shippingOrdersCount,
    completedOrdersCount,
    totalOrdersCount,
    wishlistCount,
    followingCount,
    addressCount,
    recentOrders,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: sessionUserId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
    db.order.count({ where: { customerId: sessionUserId, status: "NEW" } }),
    db.order.count({ where: { customerId: sessionUserId, status: "SHIPPING" } }),
    db.order.count({ where: { customerId: sessionUserId, status: "COMPLETED" } }),
    db.order.count({ where: { customerId: sessionUserId } }),
    db.wishlistItem.count({ where: { userId: sessionUserId } }),
    db.shopFollow.count({ where: { userId: sessionUserId } }),
    db.address.count({ where: { userId: sessionUserId } }),
    db.order.findMany({
      where: { customerId: sessionUserId },
      include: {
        shop: { select: { name: true, slug: true } },
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            price: true,
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tổng quan tài khoản"
        description="Quản lý thông tin hồ sơ, theo dõi trạng thái đơn hàng và sản phẩm yêu thích"
      />

      <EmailVerificationBanner
        emailVerified={user.emailVerified}
        showNotice={verify === "pending"}
      />

      {/* Top grid: Profile card + quick stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="flex flex-col justify-between shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-foreground">{user.name}</h3>
                  {user.emailVerified ? (
                    <Badge variant="secondary" className="gap-1 text-[11px] text-success border-success/30">
                      <CheckCircle2 className="size-3" aria-hidden /> Đã xác thực
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] text-warning border-warning/30">
                      Chưa xác thực
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 border-t pt-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Số điện thoại:</span>
              <span className="font-medium text-foreground">{user.phone || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between">
              <span>Thành viên từ:</span>
              <span className="font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Địa chỉ đã lưu:</span>
              <span className="font-medium text-foreground">{addressCount} địa chỉ</span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="#chinh-sua-ho-so" />}
              className="w-full text-xs"
            >
              Chỉnh sửa thông tin & Mật khẩu
            </Button>
          </CardFooter>
        </Card>

        {/* Quick stats grid (orders by status, wishlist, following) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:col-span-2">
          <Link href="/account?tab=orders&status=NEW" scroll={false} className="group block">
            <Card className="h-full p-4 transition-colors hover:border-primary/50 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Chờ xác nhận</span>
                <Clock className="size-4 text-warning" aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                {newOrdersCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Đơn cần xử lý</p>
            </Card>
          </Link>

          <Link href="/account?tab=orders&status=SHIPPING" scroll={false} className="group block">
            <Card className="h-full p-4 transition-colors hover:border-primary/50 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Đang giao hàng</span>
                <Truck className="size-4 text-info" aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                {shippingOrdersCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Đang vận chuyển</p>
            </Card>
          </Link>

          <Link href="/account?tab=orders&status=COMPLETED" scroll={false} className="group block">
            <Card className="h-full p-4 transition-colors hover:border-primary/50 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Đã hoàn thành</span>
                <CheckCircle2 className="size-4 text-success" aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                {completedOrdersCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Giao thành công</p>
            </Card>
          </Link>

          <Link href="/account?tab=wishlist" scroll={false} className="group block">
            <Card className="h-full p-4 transition-colors hover:border-primary/50 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Yêu thích</span>
                <Heart className="size-4 text-destructive" aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                {wishlistCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Sản phẩm đã lưu</p>
            </Card>
          </Link>

          <Link href="/account?tab=following" scroll={false} className="group block">
            <Card className="h-full p-4 transition-colors hover:border-primary/50 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Gian hàng</span>
                <Store className="size-4 text-primary" aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                {followingCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Đang theo dõi</p>
            </Card>
          </Link>

          <Link href="/account?tab=orders" scroll={false} className="group block">
            <Card className="h-full p-4 transition-colors hover:border-primary/50 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tổng đơn hàng</span>
                <ShoppingBag className="size-4 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
                {totalOrdersCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Lịch sử đặt hàng</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Đơn hàng gần đây</h3>
            <p className="text-xs text-muted-foreground">Các đơn hàng bạn đã đặt mua gần đây nhất</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/account?tab=orders" scroll={false} />}
            className="gap-1 text-xs text-primary"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Chưa có đơn hàng nào"
            description="Bạn chưa đặt mua đơn hàng nào tại Phố Đặc Sản. Hãy dạo phố và khám phá ngay nhé!"
            action={<Button render={<Link href="/market" />}>Khám phá đặc sản</Button>}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-xl border bg-card shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Gian hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const firstItem = order.items[0];
                    const otherCount = order.items.length - 1;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {order.code}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {order.shop.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                          <p className="truncate">
                            {firstItem ? firstItem.productName : "Sản phẩm"}
                            {otherCount > 0 && ` (+${otherCount} món khác)`}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm whitespace-nowrap">
                          <Price amount={order.total} />
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="xs"
                            render={<Link href={`/account/orders/${order.code}`} />}
                          >
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {recentOrders.map((order) => {
                const firstItem = order.items[0];
                const otherCount = order.items.length - 1;

                return (
                  <Card key={order.id} className="p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                      <span className="font-mono text-xs font-medium text-muted-foreground">
                        {order.code}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{order.shop.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {firstItem?.productName}
                        {otherCount > 0 && ` (+${otherCount} món khác)`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <Price amount={order.total} className="font-semibold text-sm" />
                      <Button
                        variant="outline"
                        size="xs"
                        render={<Link href={`/account/orders/${order.code}`} />}
                      >
                        Chi tiết đơn
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Profile Form & Password Form */}
      <div id="chinh-sua-ho-so" className="pt-4 border-t space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Cài đặt hồ sơ & Mật khẩu</h3>
          <p className="text-xs text-muted-foreground">
            Cập nhật họ tên, số điện thoại liên hệ và bảo mật mật khẩu
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileForm user={user} />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
