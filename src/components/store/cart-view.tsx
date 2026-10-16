"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, Tag, AlertCircle, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateVoucher, type ValidatedVoucher } from "@/server/store/cart";
import { formatVnd } from "@/components/common/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCartLines, CartLineItem } from "./cart-shared";

export function CartView() {
  const router = useRouter();
  const {
    cartItems,
    lines,
    loading,
    droppedNotice,
    shopGroups,
    grandSubtotal,
    totalQuantity,
  } = useCartLines();

  const [vouchers, setVouchers] = useState<Record<string, ValidatedVoucher>>({});
  const [voucherInputs, setVoucherInputs] = useState<Record<string, string>>({});
  const [voucherErrors, setVoucherErrors] = useState<Record<string, string>>({});
  const [isPendingVoucher, startTransitionVoucher] = useTransition();

  // Load applied vouchers from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pds_vouchers");
      if (saved) {
        setVouchers(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveVouchers = (newVouchers: Record<string, ValidatedVoucher>) => {
    setVouchers(newVouchers);
    try {
      sessionStorage.setItem("pds_vouchers", JSON.stringify(newVouchers));
    } catch {}
  };

  // Handle voucher verification
  const handleApplyVoucher = (shopId: string, shopSubtotal: number) => {
    const code = voucherInputs[shopId]?.trim();
    if (!code) {
      setVoucherErrors((prev) => ({ ...prev, [shopId]: "Vui lòng nhập mã" }));
      return;
    }

    startTransitionVoucher(async () => {
      const res = await validateVoucher(shopId, code, shopSubtotal);
      if (res.valid) {
        const updated = { ...vouchers, [shopId]: res.voucher };
        saveVouchers(updated);
        setVoucherErrors((prev) => ({ ...prev, [shopId]: "" }));
        toast.success(`Đã áp dụng mã "${res.voucher.code}" giảm ${formatVnd(res.voucher.discount)}`);
      } else {
        setVoucherErrors((prev) => ({ ...prev, [shopId]: res.error }));
      }
    });
  };

  const handleRemoveVoucher = (shopId: string) => {
    const updated = { ...vouchers };
    delete updated[shopId];
    saveVouchers(updated);
    toast.info("Đã gỡ mã giảm giá");
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Đang cập nhật giỏ hàng…</span>
      </div>
    );
  }

  if (cartItems.length === 0 || lines.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-8" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Giỏ hàng của bạn đang trống</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Khám phá các món đặc sản thơm ngon, chính gốc từ khắp các vùng miền Việt Nam nhé!
        </p>
        <Button className="mt-6 gap-2" render={<Link href="/market" />}>
          <span>Khám phá đặc sản ngay</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    );
  }

  // Calculate totals across shops
  const grandDiscount = shopGroups.reduce((sum, g) => {
    const v = vouchers[g.shopId];
    return sum + (v ? v.discount : 0);
  }, 0);
  const grandTotal = Math.max(0, grandSubtotal - grandDiscount);

  return (
    <div className="space-y-6">
      {droppedNotice && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Cập nhật giỏ hàng</AlertTitle>
          <AlertDescription>
            Một số sản phẩm trong giỏ hàng hiện đã hết hàng hoặc ngừng kinh doanh và đã được tự động loại bỏ.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        {/* Main Cart Items Grouped by Shop */}
        <div className="space-y-6">
          {shopGroups.map((group) => {
            const currentVoucher = vouchers[group.shopId];
            const discountAmount = currentVoucher?.discount || 0;
            const shopTotal = Math.max(0, group.subtotal - discountAmount);

            return (
              <div key={group.shopId} className="rounded-lg border bg-card shadow-xs">
                {/* Shop Header */}
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                  <Link
                    href={`/shops/${group.shopSlug}`}
                    className="flex items-center gap-2 font-medium hover:text-primary transition"
                  >
                    <Store className="size-4 text-primary" />
                    <span>{group.shopName}</span>
                    <span className="text-xs text-muted-foreground">({group.provinceName})</span>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {group.items.length} món
                  </span>
                </div>

                {/* Products in this shop */}
                <div className="divide-y p-4">
                  {group.items.map(({ line, quantity, lineSubtotal }) => (
                    <CartLineItem
                      key={line.variantId}
                      line={line}
                      quantity={quantity}
                      lineSubtotal={lineSubtotal}
                    />
                  ))}
                </div>

                {/* Shop Voucher & Subtotal Footer */}
                <div className="border-t bg-muted/10 p-4 space-y-3">
                  {/* Voucher section */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Tag className="size-3.5" />
                      <span>Mã giảm giá của shop:</span>
                    </div>

                    {currentVoucher ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {currentVoucher.code} (-{formatVnd(currentVoucher.discount)})
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleRemoveVoucher(group.shopId)}
                          className="text-xs text-destructive hover:bg-destructive/10"
                        >
                          Gỡ
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="MÃ GIẢM GIÁ"
                          value={voucherInputs[group.shopId] || ""}
                          onChange={(e) =>
                            setVoucherInputs((prev) => ({
                              ...prev,
                              [group.shopId]: e.target.value.toUpperCase(),
                            }))
                          }
                          className="h-8 w-32 uppercase text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPendingVoucher}
                          onClick={() => handleApplyVoucher(group.shopId, group.subtotal)}
                          className="h-8 text-xs"
                        >
                          Áp dụng
                        </Button>
                      </div>
                    )}
                  </div>

                  {voucherErrors[group.shopId] && (
                    <p className="text-right text-xs text-destructive">
                      {voucherErrors[group.shopId]}
                    </p>
                  )}

                  {/* Shop Summary line */}
                  <div className="flex items-center justify-between border-t pt-2 text-sm">
                    <span className="text-muted-foreground">Tổng gian hàng:</span>
                    <div className="text-right">
                      {discountAmount > 0 && (
                        <span className="mr-2 text-xs text-muted-foreground line-through">
                          {formatVnd(group.subtotal)}
                        </span>
                      )}
                      <span className="font-semibold text-foreground">
                        {formatVnd(shopTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total Sidebar Card */}
        <div>
          <div className="sticky top-20 rounded-lg border bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-foreground text-lg border-b pb-3">
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính ({totalQuantity} sản phẩm):</span>
                <span className="font-medium text-foreground">{formatVnd(grandSubtotal)}</span>
              </div>

              {grandDiscount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Giảm giá từ voucher:</span>
                  <span>-{formatVnd(grandDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Phí vận chuyển:</span>
                <span className="italic">Shop sẽ báo khi gọi xác nhận</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-foreground">Tổng thanh toán:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    {formatVnd(grandTotal)}
                  </div>
                  <span className="text-xs text-muted-foreground">(Thanh toán khi nhận hàng)</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => router.push("/checkout")}
              className="w-full gap-2 text-base font-semibold"
            >
              <span>Tiến hành đặt hàng</span>
              <ArrowRight className="size-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Không cần thanh toán online. Shop sẽ liên hệ qua điện thoại để xác nhận đơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
