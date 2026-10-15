"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { toast } from "sonner";
import { cart } from "@/lib/cart";
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
}: {
  variants: VariantItem[];
  productName: string;
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
    toast.success(`Đã thêm ${quantity} "${productName} (${selectedVariant.name})" vào giỏ hàng!`, {
      action: {
        label: "Xem giỏ hàng",
        onClick: () => router.push("/gio-hang"),
      },
    });
  };

  const handleBuyNow = () => {
    if (!selectedVariant || isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    cart.add(selectedVariant.id, quantity);
    router.push("/gio-hang");
  };

  return (
    <div className="space-y-6">
      {/* Price section */}
      <div className="flex items-baseline gap-3 rounded-lg bg-muted/30 p-4">
        <Price
          amount={selectedVariant?.price || 0}
          original={selectedVariant?.compareAtPrice ?? undefined}
          className="text-2xl font-bold text-primary md:text-3xl"
        />
        {selectedVariant?.stock > 0 ? (
          <span className="text-xs text-muted-foreground">
            (Còn {selectedVariant.stock} sản phẩm)
          </span>
        ) : (
          <span className="text-xs font-medium text-destructive">
            (Tạm hết hàng)
          </span>
        )}
      </div>

      {/* Variant selection */}
      {variants.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-sm font-medium text-foreground">
            Phân loại: <span className="font-semibold text-primary">{selectedVariant?.name}</span>
          </label>
          <div className="flex flex-wrap gap-2.5" role="radiogroup">
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
                    "relative flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border bg-card text-foreground hover:border-foreground/30",
                    disabled && "cursor-not-allowed opacity-40 line-through hover:border-border"
                  )}
                >
                  {isSelected && <Check className="size-3.5 text-primary" />}
                  <span>{v.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({formatVnd(v.price)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity section */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Số lượng:</label>
        <QuantityInput
          value={quantity}
          onChange={(val) => setQuantity(Math.min(val, maxAvailable || 1))}
          min={1}
          max={Math.max(1, maxAvailable)}
        />
      </div>

      {/* CTA action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="flex-1 gap-2 border-primary text-primary hover:bg-primary/5 hover:text-primary"
        >
          <ShoppingCart className="size-5" />
          <span>Thêm vào giỏ</span>
        </Button>

        <Button
          type="button"
          size="lg"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Zap className="size-5" />
          <span>Mua ngay</span>
        </Button>
      </div>
    </div>
  );
}
