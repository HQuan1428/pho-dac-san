"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check, Truck, ShieldCheck, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { cart, setCartSheetOpen } from "@/lib/cart";
import { formatVnd, Price } from "@/components/common/price";
import { QuantityInput } from "@/components/common/quantity-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VariantItem = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
};

export function ProductPurchaseBox({
  variants,
  productName,
  showMobileBar = false,
  showTrustBadges = true,
}: {
  variants: VariantItem[];
  productName: string;
  showMobileBar?: boolean;
  showTrustBadges?: boolean;
}) {
  const router = useRouter();

  // Find first in-stock variant or default to first
  const firstAvailable = variants.find((v) => v.stock > 0) || variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string>(firstAvailable?.id || "");
  const [quantity, setQuantity] = useState<number>(1);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const maxAvailable = selectedVariant?.stock || 0;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    cart.add(selectedVariant.id, quantity);
    toast.success(`Đã thêm ${quantity} "${productName} (${selectedVariant.name})" vào giỏ hàng!`);
    setCartSheetOpen(true);
  };

  const handleBuyNow = () => {
    if (!selectedVariant || isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    cart.add(selectedVariant.id, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4">
      {/* Price section */}
      <div className="flex items-baseline justify-between gap-3 rounded-lg bg-muted/40 p-3.5 border">
        <div className="flex items-baseline gap-2">
          <Price
            amount={selectedVariant?.price || 0}
            original={selectedVariant?.compareAtPrice ?? undefined}
            className="text-2xl font-bold text-primary"
          />
        </div>
        {selectedVariant?.stock > 0 ? (
          <span className="text-xs text-muted-foreground font-medium">
            Còn {selectedVariant.stock} sản phẩm
          </span>
        ) : (
          <span className="text-xs font-medium text-destructive">
            Tạm hết hàng
          </span>
        )}
      </div>

      {/* Variant selection as chips with Check icon on selected */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <span>Phân loại:</span>
            <span className="font-semibold text-foreground">{selectedVariant?.name}</span>
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Phân loại sản phẩm">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              const disabled = v.stock <= 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary font-semibold"
                      : "border-border bg-card text-foreground hover:border-foreground/30",
                    disabled && "cursor-not-allowed opacity-40 line-through hover:border-border"
                  )}
                >
                  {isSelected && <Check className="size-3.5 text-primary shrink-0" aria-hidden="true" />}
                  <span>{v.name}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    ({formatVnd(v.price)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity section */}
      <div className="flex items-center gap-3 pt-1">
        <label className="text-xs font-medium text-muted-foreground">Số lượng:</label>
        <QuantityInput
          value={quantity}
          onChange={(val) => setQuantity(Math.min(val, maxAvailable || 1))}
          min={1}
          max={Math.max(1, maxAvailable)}
        />
      </div>

      {/* CTA action buttons: EXACTLY ONE primary solid green ("Thêm vào giỏ"), outline ("Mua ngay") */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <Button
          type="button"
          size="default"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-medium h-10 shadow-xs cursor-pointer"
        >
          <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
          <span>Thêm vào giỏ</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="default"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="gap-1.5 border-primary text-primary hover:bg-primary/10 hover:text-primary text-xs sm:text-sm font-medium h-10 cursor-pointer"
        >
          <Zap className="size-4 shrink-0" aria-hidden="true" />
          <span>Mua ngay</span>
        </Button>
      </div>

      {/* Shipping & COD Reassurance Notes */}
      {showTrustBadges && (
        <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <Truck className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>Giao hàng toàn quốc · Đóng gói bảo quản cẩn thận</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>Kiểm tra hàng trước khi thanh toán (COD)</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>Shop gọi điện xác nhận chi tiết trước khi gửi</span>
          </div>
        </div>
      )}

      {/* Mobile sticky bottom buy bar (price + ONE primary "Thêm vào giỏ") */}
      {showMobileBar && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur-md p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-muted-foreground truncate">
              {selectedVariant ? selectedVariant.name : "Giá"}
            </span>
            <Price
              amount={selectedVariant?.price || 0}
              className="text-base font-bold text-primary"
            />
          </div>
          <Button
            type="button"
            size="default"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-medium h-10 px-5 shadow-xs shrink-0 cursor-pointer"
          >
            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
            <span>Thêm vào giỏ</span>
          </Button>
        </div>
      )}
    </div>
  );
}

