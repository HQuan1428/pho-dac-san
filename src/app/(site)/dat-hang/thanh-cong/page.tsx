import Link from "next/link";
import { CheckCircle2, PhoneCall, ArrowRight, Store, ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";
import { formatVnd } from "@/components/common/price";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Đặt hàng thành công — Phố Đặc Sản",
  description: "Cảm ơn bạn đã đặt hàng trên Phố Đặc Sản. Các shop sẽ liên hệ sớm nhất để xác nhận đơn hàng.",
};

function maskPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return trimmed;
  const prefix = trimmed.slice(0, 2);
  const suffix = trimmed.slice(-2);
  const maskedLength = trimmed.length - 4;
  return `${prefix}${"*".repeat(maskedLength)}${suffix}`;
}

export default async function DatHangThanhCongPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const orders = checkout
    ? await db.order.findMany({
        where: {
          checkoutId: checkout,
          createdAt: { gte: oneDayAgo },
        },
        include: {
          shop: { include: { province: true } },
          items: true,
          voucher: true,
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Không tìm thấy thông tin đơn hàng</h1>
        <p className="text-sm text-muted-foreground">
          Đơn hàng không tồn tại hoặc đã quá 24 giờ. Bạn có thể kiểm tra danh sách đơn hàng trong trang tài khoản.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button render={<Link href="/cho" />}>Tiếp tục mua sắm</Button>
          <Button variant="outline" render={<Link href="/tai-khoan/don-hang" />}>
            Xem đơn của tôi
          </Button>
        </div>
      </div>
    );
  }

  const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const firstOrder = orders[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 space-y-8">
      {/* Success banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Đặt hàng thành công!
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Cảm ơn bạn đã tin tưởng lựa chọn đặc sản Việt. Đơn hàng của bạn đã được chuyển đến từng gian hàng.
        </p>
      </div>

      {/* Confirmation Callout */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3.5">
        <PhoneCall className="size-6 text-primary shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1 text-sm">
          <h2 className="font-semibold text-primary">
            Shop sẽ gọi điện cho bạn để xác nhận đơn hàng
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Các gian hàng sẽ sớm liên hệ qua số điện thoại{" "}
            <strong className="text-foreground">{maskPhone(firstOrder.customerPhone)}</strong> để xác nhận số lượng,
            thời gian giao và thông báo phí vận chuyển chi tiết trước khi gửi hàng.
          </p>
          <p className="text-xs text-muted-foreground font-medium pt-1">
            Hình thức thanh toán: Trả tiền mặt khi nhận hàng (COD).
          </p>
        </div>
      </div>

      {/* Recipient summary */}
      <div className="rounded-lg border bg-card p-5 space-y-2 text-sm shadow-xs">
        <h2 className="font-semibold text-foreground border-b pb-2">Thông tin người nhận</h2>
        <div className="grid gap-1 sm:grid-cols-2 text-muted-foreground pt-1">
          <div>Họ và tên: <strong className="text-foreground">{firstOrder.customerName}</strong></div>
          <div>Số điện thoại: <strong className="text-foreground">{maskPhone(firstOrder.customerPhone)}</strong></div>
          <div className="sm:col-span-2">
            Địa chỉ giao hàng: <strong className="text-foreground">{firstOrder.shippingAddress}</strong>
          </div>
          {firstOrder.note && (
            <div className="sm:col-span-2 italic text-xs">
              Ghi chú: {firstOrder.note}
            </div>
          )}
        </div>
      </div>

      {/* Created Orders by Shop */}
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground text-lg">
          Đơn hàng được tạo ({orders.length} đơn tương ứng {orders.length} gian hàng)
        </h2>

        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                <Store className="size-4 text-primary" />
                <span className="font-semibold text-foreground">{order.shop.name}</span>
                <span className="text-xs text-muted-foreground">({order.shop.province.name})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
                  {order.code}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            {/* Item list */}
            <div className="divide-y text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-xs">
                  <div>
                    <span className="font-medium text-foreground">{item.productName}</span>
                    <span className="text-muted-foreground ml-1.5">({item.variantName}) × {item.quantity}</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatVnd(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="border-t pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính:</span>
                <span>{formatVnd(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Giảm giá (Voucher):</span>
                  <span>-{formatVnd(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t">
                <span>Tổng đơn:</span>
                <span className="text-primary">{formatVnd(order.total)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grand summary & actions */}
      <div className="rounded-lg border bg-muted/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Tổng thanh toán cho tất cả các đơn:</div>
          <div className="text-2xl font-bold text-primary tabular-nums">
            {formatVnd(grandTotal)}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button render={<Link href="/cho" />} className="flex-1 sm:flex-initial gap-2">
            <span>Tiếp tục mua hàng</span>
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            render={<Link href="/tai-khoan/don-hang" />}
            className="flex-1 sm:flex-initial"
          >
            Đơn mua của tôi
          </Button>
        </div>
      </div>
    </div>
  );
}
