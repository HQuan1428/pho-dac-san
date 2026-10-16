import Link from "next/link";
import { ArrowLeft, Phone, MapPin, User, FileText, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Price } from "@/components/common/price";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSellerOrderByCode } from "@/server/seller/orders";
import { OrderStatusActions } from "@/components/seller/order-status-actions";
import { CallNoteForm } from "@/components/seller/call-note-form";
import { CustomerFlagToggle } from "@/components/seller/customer-flag-toggle";

export const metadata = {
  title: "Chi tiết đơn hàng",
};

interface OrderDetailPageProps {
  params: Promise<{ code: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { code } = await params;
  const { order, customerFlag } = await getSellerOrderByCode(code);

  return (
    <div className="space-y-6">
      {/* Top bar with back button & checkout id */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/seller/orders" />}
        >
          <ArrowLeft className="size-4 mr-1.5" />
          Quay lại danh sách đơn hàng
        </Button>

        <span className="font-mono text-xs text-muted-foreground">
          Checkout ID: {order.checkoutId}
        </span>
      </div>

      <PageHeader
        title={`Đơn hàng #${order.code}`}
        description={`Đặt lúc ${new Date(order.createdAt).toLocaleString("vi-VN")}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      {/* 2 columns layout: items + timeline left (2/3), customer card with call button + actions right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Items + Timeline (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Items Table */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b pb-3">
              Chi tiết sản phẩm đặt mua
            </h2>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 dark:bg-muted/30 backdrop-blur z-10">
                  <TableRow className="h-11">
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Phân loại</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id} className="h-11">
                      <TableCell className="font-medium text-foreground text-xs">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {item.variantName}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs">
                        <Price amount={item.price} />
                      </TableCell>
                      <TableCell className="text-center tabular-nums text-xs">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs">
                        <Price amount={item.price * item.quantity} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-72 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Tạm tính hàng:</span>
                  <Price amount={order.subtotal} />
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-primary font-medium text-xs">
                    <span>
                      Giảm giá {order.voucher ? `(${order.voucher.code})` : ""}:
                    </span>
                    <span>-{order.discount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2 font-bold text-sm text-foreground">
                  <span>Tổng thu tiền mặt (COD):</span>
                  <span className="text-primary tabular-nums">
                    {order.total.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground text-right italic">
                  * Khách thanh toán tiền mặt khi nhận hàng (COD)
                </p>
              </div>
            </div>
          </div>

          {/* Events Timeline */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Clock className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Lịch sử đơn hàng & Ghi chú cuộc gọi
              </h2>
            </div>

            {order.events.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Chưa có ghi nhận sự kiện nào cho đơn hàng này.
              </p>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {order.events.map((evt) => (
                  <div key={evt.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-1 flex size-3.5 items-center justify-center rounded-full border bg-background">
                      <div
                        className={`size-1.5 rounded-full ${
                          evt.status === "COMPLETED"
                            ? "bg-success"
                            : evt.status === "CANCELLED"
                              ? "bg-destructive"
                              : "bg-primary"
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {evt.status ? (
                          <OrderStatusBadge status={evt.status} />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                            <FileText className="size-3 text-primary" />
                            Ghi chú cuộc gọi
                          </span>
                        )}

                        <span className="text-xs text-muted-foreground">bởi</span>
                        <span className="text-xs font-medium text-foreground">
                          {evt.actor?.name || "Hệ thống"}
                        </span>

                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {new Date(evt.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      {evt.note && (
                        <div className="rounded-md border bg-muted/30 p-2.5 text-xs text-foreground mt-1">
                          {evt.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Card with Call Button + Actions (1/3 width, sticky) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
          {/* Customer Warning Flag if flagged */}
          <CustomerFlagToggle phone={order.customerPhone} flag={customerFlag} />

          {/* Customer Card with BIG call button */}
          <div className="rounded-lg border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-3">
              <User className="size-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Thông tin khách hàng</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Người nhận hàng:</span>
                <span className="font-semibold text-foreground text-sm">
                  {order.customerName}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Số điện thoại liên hệ:</span>
                <span className="font-mono font-bold text-base text-foreground block mb-2">
                  {order.customerPhone}
                </span>

                {/* BIG CALL BUTTON */}
                <Button
                  className="w-full justify-center bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:bg-primary/90"
                  render={
                    <a href={`tel:${order.customerPhone}`} />
                  }
                >
                  <Phone className="size-4 fill-current animate-pulse" />
                  Gọi điện xác nhận ngay
                </Button>
              </div>

              {order.customerEmail && (
                <div>
                  <span className="text-[11px] text-muted-foreground block">Email:</span>
                  <span className="font-medium text-foreground">{order.customerEmail}</span>
                </div>
              )}

              <div>
                <span className="text-[11px] text-muted-foreground block">Địa chỉ nhận hàng:</span>
                <div className="mt-1 flex items-start gap-1.5 text-foreground">
                  <MapPin className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                  <span>{order.shippingAddress}</span>
                </div>
              </div>

              {order.note && (
                <div className="rounded-md border bg-muted/40 p-2.5 text-xs">
                  <span className="font-semibold text-foreground block mb-0.5">
                    Lời nhắn từ khách:
                  </span>
                  <span className="text-muted-foreground italic">&ldquo;{order.note}&rdquo;</span>
                </div>
              )}

              {order.cancelReason && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                  <span className="font-semibold block mb-0.5">Lý do hủy đơn hàng:</span>
                  <span>{order.cancelReason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status transition controls */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Trạng thái đơn hàng
            </h3>
            <OrderStatusActions code={order.code} currentStatus={order.status} />
          </div>

          {/* Call note form */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Ghi chú cuộc gọi
            </h3>
            <CallNoteForm code={order.code} />
          </div>
        </div>
      </div>
    </div>
  );
}
