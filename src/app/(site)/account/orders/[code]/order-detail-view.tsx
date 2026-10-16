import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  RotateCcw,
  Store,
} from "lucide-react";
import { type OrderStatus } from "@prisma/client";
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
import { ORDER_STATUS, OrderStatusBadge } from "@/components/common/order-status-badge";
import { Price } from "@/components/common/price";
import { cn } from "@/lib/utils";

export type OrderDetailData = {
  id: string;
  code: string;
  status: OrderStatus;
  createdAt: Date;
  subtotal: number;
  discount: number;
  total: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note: string | null;
  shop: {
    name: string;
    slug: string;
    phone: string;
  };
  items: {
    id: string;
    productName: string;
    variantName: string | null;
    price: number;
    quantity: number;
    product: {
      slug: string;
    } | null;
    review: {
      id: string;
    } | null;
  }[];
  events: {
    id: string;
    status: OrderStatus | null;
    note: string | null;
    createdAt: Date;
  }[];
};

export function OrderDetailView({
  order,
  inModal = false,
}: {
  order: OrderDetailData;
  inModal?: boolean;
}) {
  const isCompleted = order.status === "COMPLETED";

  return (
    <div className={cn("space-y-6", inModal ? "p-4 sm:p-6" : "")}>
      {/* Back button (full page only) */}
      {!inModal && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/account?tab=orders" scroll={false} />}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span>Quay lại danh sách đơn</span>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Đơn hàng #{order.code}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Đặt lúc{" "}
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Primary action (at most ONE, "Mua lại" if completed) */}
        {isCompleted && (
          <Button
            render={<Link href={`/shops/${order.shop.slug}`} />}
            className="gap-1.5 shrink-0"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span>Mua lại</span>
          </Button>
        )}
      </div>

      {/* Info Cards: Shop contact + Delivery info */}
      <div className={cn("grid gap-4", inModal ? "grid-cols-1" : "md:grid-cols-3")}>
        {/* Shop contact */}
        <Card className="shadow-2xs">
          <CardHeader className="pb-2.5">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Store className="size-3.5 text-primary" aria-hidden />
              <span>Gian hàng</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Link
              href={`/shops/${order.shop.slug}`}
              className="font-semibold text-sm text-foreground hover:text-primary transition line-clamp-1"
            >
              {order.shop.name}
            </Link>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5" aria-hidden />
              <a href={`tel:${order.shop.phone}`} className="hover:underline text-foreground">
                {order.shop.phone}
              </a>
            </p>
            <div>
              <Button
                variant="outline"
                size="xs"
                render={<Link href={`/shops/${order.shop.slug}`} />}
                className="mt-1 text-[11px]"
              >
                Ghé thăm gian hàng
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer & delivery address */}
        <Card className={cn("shadow-2xs", inModal ? "" : "md:col-span-2")}>
          <CardHeader className="pb-2.5">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MapPin className="size-3.5 text-primary" aria-hidden />
              <span>Địa chỉ nhận hàng</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <p className="font-semibold text-sm text-foreground">
              {order.customerName}
              <span className="font-normal text-muted-foreground text-xs ml-2">
                · {order.customerPhone}
              </span>
            </p>
            <p className="text-muted-foreground leading-relaxed">{order.shippingAddress}</p>
            {order.note && (
              <p className="text-xs text-muted-foreground pt-1 border-t mt-2">
                <span className="font-medium text-foreground">Ghi chú:</span> {order.note}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <Card className="shadow-2xs overflow-hidden">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-sm font-semibold">
            Danh sách sản phẩm ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Sản phẩm</TableHead>
                  <TableHead className="text-right text-xs">Đơn giá</TableHead>
                  <TableHead className="text-center text-xs">Số lượng</TableHead>
                  <TableHead className="text-right text-xs">Thành tiền</TableHead>
                  {isCompleted && <TableHead className="text-center text-xs">Đánh giá</TableHead>}
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
                    <TableRow key={item.id} className="text-xs">
                      <TableCell>
                        <p className="font-medium text-foreground">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-[11px] text-muted-foreground">
                            Phân loại: {item.variantName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <Price amount={item.price} />
                      </TableCell>
                      <TableCell className="text-center font-mono font-medium">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
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
                              className="text-[11px] gap-1"
                            >
                              <MessageSquare className="size-3" aria-hidden />
                              <span>Viết đánh giá</span>
                            </Button>
                          ) : item.review ? (
                            <Badge variant="secondary" className="text-[10px] font-normal">
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
          <div className="border-t p-4 bg-muted/15">
            <div className="ml-auto max-w-xs space-y-1.5 text-xs">
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
              <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                <span>Tổng thanh toán</span>
                <Price amount={order.total} className="text-base text-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order status timeline with ORDER_STATUS icons */}
      <Card className="shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="size-4 text-primary" aria-hidden />
            <span>Lịch sử trạng thái đơn hàng</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {order.events.length === 0 ? (
            <p className="text-xs text-muted-foreground">
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
            <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {order.events.map((event) => {
                const statusInfo = event.status ? ORDER_STATUS[event.status] : null;
                const StatusIcon = statusInfo ? statusInfo.icon : Clock;

                return (
                  <div key={event.id} className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-0 flex size-6 items-center justify-center rounded-full border bg-card ring-2 ring-primary/20">
                      <StatusIcon className="size-3 text-primary" aria-hidden />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {event.status && <OrderStatusBadge status={event.status} />}
                        <span className="text-[11px] text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground leading-relaxed">{event.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
