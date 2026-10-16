"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Store, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { useCartSheetOpen, setCartSheetOpen } from "@/lib/cart";
import { formatVnd } from "@/components/common/price";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCartLines, CartLineItem } from "./cart-shared";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export function CartSheet() {
  const isOpen = useCartSheetOpen();
  const isMobile = useIsMobile();
  const router = useRouter();

  const {
    cartItems,
    lines,
    loading,
    shopGroups,
    grandSubtotal,
    totalQuantity,
  } = useCartLines();

  const isEmpty = !loading && (cartItems.length === 0 || lines.length === 0);

  return (
    <Sheet open={isOpen} onOpenChange={setCartSheetOpen}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col gap-0 p-0 w-full sm:max-w-md",
          isMobile
            ? "max-h-[90dvh] rounded-t-2xl border-t shadow-2xl"
            : "h-full border-l"
        )}
      >
        <SheetHeader className="border-b px-4 py-3 pr-10 shrink-0 text-left">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" aria-hidden />
            <SheetTitle className="text-base font-semibold">
              Giỏ hàng ({totalQuantity})
            </SheetTitle>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8 text-center">
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
            <span className="text-xs text-muted-foreground">Đang tải giỏ hàng…</span>
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="size-7" aria-hidden />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">Giỏ hàng của bạn đang trống</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Khám phá các món đặc sản thơm ngon từ khắp các vùng miền Việt Nam nhé!
              </p>
            </div>
            <Button
              className="mt-2 gap-2"
              onClick={() => {
                setCartSheetOpen(false);
                router.push("/market");
              }}
            >
              <span>Khám phá chợ</span>
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y px-4 py-2">
              {shopGroups.map((group) => (
                <div key={group.shopId} className="py-3 first:pt-1 last:pb-1 space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <Link
                      href={`/shops/${group.shopSlug}`}
                      onClick={() => setCartSheetOpen(false)}
                      className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition text-foreground"
                    >
                      <Store className="size-3.5 text-primary" aria-hidden />
                      <span>{group.shopName}</span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        ({group.provinceName})
                      </span>
                    </Link>
                    <span className="text-[11px] text-muted-foreground">
                      {group.items.length} món
                    </span>
                  </div>

                  <div className="divide-y rounded-lg border bg-card/60 p-2.5 shadow-2xs">
                    {group.items.map(({ line, quantity, lineSubtotal }) => (
                      <CartLineItem
                        key={line.variantId}
                        line={line}
                        quantity={quantity}
                        lineSubtotal={lineSubtotal}
                        compact
                        onNavigate={() => setCartSheetOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t bg-muted/20 p-4 space-y-3 shrink-0">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tạm tính:</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary tabular-nums">
                    {formatVnd(grandSubtotal)}
                  </span>
                  <p className="text-[11px] text-muted-foreground">Chưa gồm mã giảm giá & phí ship</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  size="lg"
                  className="w-full gap-2 font-semibold"
                  onClick={() => {
                    setCartSheetOpen(false);
                    router.push("/checkout");
                  }}
                >
                  <span>Thanh toán</span>
                  <ArrowRight className="size-4" aria-hidden />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    setCartSheetOpen(false);
                    router.push("/cart");
                  }}
                >
                  Xem trang giỏ hàng
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
