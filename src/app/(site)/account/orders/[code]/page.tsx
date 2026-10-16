import Link from "next/link";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import {
  ArrowLeft,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  Store,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { Price } from "@/components/common/price";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng - Phố Đặc Sản",
};

export default async function OrderDetailPage(props: {
  params: Promise<{ code: string }>;
}) {
  const user = await requireUser("/account/orders");
  const params = await props.params;

  const order = await db.order.findUnique({
    where: { code: params.code },
    include: {
      shop: {
        select: {
          name: true,
          slug: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              slug: true,
            },
          },
          review: {
            select: {
              id: true,
            },
          },
        },
      },
      events: {
        where: {
          status: { not: null },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  // Only the owner can view (404 otherwise)
  if (!order || order.customerId !== user.id) {
    notFound();
  }

  const isCompleted = order.status === "COMPLETED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/account/orders" />}
          className="gap-1 text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách đơn
        </Button>
      </div>

      <PageHeader
        title={`Đơn hàng #${order.code}`}
        description={`Đặt ngày ${new Date(order.createdAt).toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Shop info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Store className="size-4 text-primary" />
              Thông tin gian hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-foreground">{order.shop.name}</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5" />
              <a href={`tel:${order.shop.phone}`} className="hover:underline">
                {order.shop.phone}
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Customer & delivery address */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-primary" />
              Địa chỉ nhận hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-medium text-foreground">
              {order.customerName}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {order.customerPhone}
              </span>
            </p>
            <p className="text-muted-foreground">{order.shippingAddress}</p>
            {order.note && (
              <p className="text-xs text-muted-foreground pt-1">
                <span className="font-medium text-foreground">Ghi chú:</span>{" "}
                {order.note}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Danh sách sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                  {isCompleted && <TableHead className="text-center">Đánh giá</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const canReview =
                    isCompleted &&
                    !item.review &&
                    item.product?.slug &&
                    order.shop.slug;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Phân loại: {item.variantName}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Price amount={item.price} />
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <Price amount={itemTotal} />
                      </TableCell>
                      {isCompleted && (
                        <TableCell className="text-center">
                          {canReview ? (
                            <Button
                              variant="outline"
                              size="xs"
                              render={
                                <Link
                                  href={`/products/${order.shop.slug}/${item.product!.slug}#danh-gia`}
                                />
                              }
                            >
                              <MessageSquare className="size-3" />
                              Viết đánh giá
                            </Button>
                          ) : item.review ? (
                            <Badge variant="secondary" className="text-xs font-normal">
                              Đã đánh giá
                            </Badge>
                          ) : null}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pricing summary */}
          <div className="border-t p-4 sm:p-6">
            <div className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <Price amount={order.subtotal} />
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Giảm giá</span>
                  <span>
                    -<Price amount={order.discount} />
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold text-foreground">
                <span>Tổng thanh toán</span>
                <Price amount={order.total} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order status timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="size-4 text-primary" />
            Lịch sử trạng thái đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Đơn hàng vừa được tạo lúc{" "}
              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              .
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {order.events.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 top-1.5 size-2.5 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.status && <OrderStatusBadge status={event.status} />}
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-sm text-muted-foreground">{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
