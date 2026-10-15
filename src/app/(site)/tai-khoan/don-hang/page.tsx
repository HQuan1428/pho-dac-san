import Link from "next/link";
import { type Metadata } from "next";
import { ChevronRight, ShoppingBag, Store } from "lucide-react";
import { type OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const user = await requireUser("/tai-khoan/don-hang");
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
              ? "/tai-khoan/don-hang"
              : `/tai-khoan/don-hang?status=${tab.value}`;

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
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items[0];
            const otherItemsCount = order.items.length - 1;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b bg-muted/20 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Store className="size-4 text-muted-foreground" />
                      {order.shop.name}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {order.code}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      {firstItem && (
                        <p className="text-sm font-medium">
                          {firstItem.productName}
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            ({firstItem.variantName}) × {firstItem.quantity}
                          </span>
                        </p>
                      )}
                      {otherItemsCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          và {otherItemsCount} sản phẩm khác
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-muted-foreground block">
                          Tổng thanh toán
                        </span>
                        <span className="text-base font-semibold">
                          <Price amount={order.total} />
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/tai-khoan/don-hang/${order.code}`} />}
                      >
                        Chi tiết đơn
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
