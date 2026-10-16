import Link from "next/link";
import { type Metadata } from "next";
import { ChevronRight, ShoppingBag, Store } from "lucide-react";
import { type OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export const metadata: Metadata = {
  title: "Đơn hàng của tôi - Phố Đặc Sản",
};

const statusTabs: { label: string; value: string }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "NEW" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đang giao", value: "SHIPPING" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export default async function CustomerOrdersPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser("/account/orders");
  const searchParams = await props.searchParams;
  const currentTab = searchParams.status || "ALL";

  const statusFilter =
    currentTab !== "ALL" && ["NEW", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].includes(currentTab)
      ? (currentTab as OrderStatus)
      : undefined;

  const orders = await db.order.findMany({
    where: {
      customerId: user.id,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      shop: {
        select: {
          name: true,
          slug: true,
        },
      },
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
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đơn hàng của tôi"
        description="Theo dõi trạng thái và lịch sử tất cả các đơn hàng bạn đã đặt"
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto border-b pb-2">
        {statusTabs.map((tab) => {
          const isActive = currentTab === tab.value;
          const href =
            tab.value === "ALL"
              ? "/account/orders"
              : `/account/orders?status=${tab.value}`;

          return (
            <Link
              key={tab.value}
              href={href}
              className={`rounded-md px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary font-medium text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Chưa có đơn hàng nào"
          description={
            currentTab === "ALL"
              ? "Bạn chưa đặt mua đơn hàng nào tại Phố Đặc Sản. Hãy dạo phố và chọn mua những thức quà ngon nhé!"
              : "Không tìm thấy đơn hàng nào ở trạng thái này."
          }
          action={
            <Button render={<Link href="/" />}>
              Khám phá đặc sản ngay
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Gian hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead className="text-right">Tổng thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const firstItem = order.items[0];
                  const otherCount = order.items.length - 1;

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {order.code}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          <Store className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[140px]">{order.shop.name}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                        <p className="truncate font-medium text-foreground">
                          {firstItem ? firstItem.productName : "Sản phẩm"}
                          {firstItem?.variantName && (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              ({firstItem.variantName})
                            </span>
                          )}
                          {firstItem?.quantity && (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              × {firstItem.quantity}
                            </span>
                          )}
                        </p>
                        {otherCount > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            +{otherCount} sản phẩm khác
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
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

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3">
            {orders.map((order) => {
              const firstItem = order.items[0];
              const otherItemsCount = order.items.length - 1;

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b bg-muted/20 py-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="flex items-center gap-1 font-medium">
                        <Store className="size-3.5 text-muted-foreground" />
                        {order.shop.name}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-muted-foreground">
                        {order.code}
                      </span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        {firstItem && (
                          <p className="text-sm font-medium">
                            {firstItem.productName}
                            <span className="text-xs text-muted-foreground font-normal">
                              {" "}
                              ({firstItem.variantName}) × {firstItem.quantity}
                            </span>
                          </p>
                        )}
                        {otherItemsCount > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            và {otherItemsCount} sản phẩm khác
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t pt-2.5">
                        <div>
                          <span className="text-[11px] text-muted-foreground block">
                            Tổng thanh toán
                          </span>
                          <span className="text-sm font-semibold">
                            <Price amount={order.total} />
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="xs"
                          render={<Link href={`/account/orders/${order.code}`} />}
                        >
                          Chi tiết đơn
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
