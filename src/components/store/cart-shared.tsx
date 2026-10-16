"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart, cart } from "@/lib/cart";
import { getCartLines, type CartLineData } from "@/server/store/cart";
import { formatVnd, Price } from "@/components/common/price";
import { QuantityInput } from "@/components/common/quantity-input";
import { Button } from "@/components/ui/button";
import { getProductImageUrl, getProductPlaceholder } from "./placeholder";

export type ShopGroup = {
  shopId: string;
  shopName: string;
  shopSlug: string;
  provinceName: string;
  items: Array<{
    line: CartLineData;
    quantity: number;
    lineSubtotal: number;
  }>;
  subtotal: number;
};

export function useCartLines() {
  const cartItems = useCart();
  const [lines, setLines] = useState<CartLineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [droppedNotice, setDroppedNotice] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (cartItems.length === 0) {
        setLines([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const variantIds = cartItems.map((i) => i.variantId);
        const res = await getCartLines(variantIds);

        if (!active) return;

        if (res.droppedVariantIds.length > 0) {
          res.droppedVariantIds.forEach((id) => cart.remove(id));
          setDroppedNotice(true);
        }

        setLines(res.lines);
      } catch (err) {
        console.error("Failed to load cart lines:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [cartItems]);

  const shopGroups: ShopGroup[] = [];
  const itemMap = new Map(cartItems.map((i) => [i.variantId, i.quantity]));

  for (const line of lines) {
    const qty = itemMap.get(line.variantId) || 1;
    let group = shopGroups.find((g) => g.shopId === line.shopId);
    if (!group) {
      group = {
        shopId: line.shopId,
        shopName: line.shopName,
        shopSlug: line.shopSlug,
        provinceName: line.provinceName,
        items: [],
        subtotal: 0,
      };
      shopGroups.push(group);
    }
    const lineSubtotal = line.price * qty;
    group.items.push({ line, quantity: qty, lineSubtotal });
    group.subtotal += lineSubtotal;
  }

  const grandSubtotal = shopGroups.reduce((sum, g) => sum + g.subtotal, 0);
  const totalQuantity = cartItems.reduce((n, i) => n + i.quantity, 0);

  return {
    cartItems,
    lines,
    loading,
    droppedNotice,
    shopGroups,
    grandSubtotal,
    totalQuantity,
  };
}

export function CartLineItem({
  line,
  quantity,
  lineSubtotal,
  compact = false,
  onNavigate,
}: {
  line: CartLineData;
  quantity: number;
  lineSubtotal: number;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const imageUrl = getProductImageUrl(line.productImages, line.provinceName);
  const placeholderUrl = getProductPlaceholder(line.provinceName);

  const handleRemove = () => {
    cart.remove(line.variantId);
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  if (compact) {
    return (
      <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={line.productName}
          onError={(e) => {
            e.currentTarget.src = placeholderUrl;
          }}
          className="size-16 rounded-md border object-cover bg-muted shrink-0"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1">
              <Link
                href={`/products/${line.shopSlug}/${line.productSlug}`}
                onClick={onNavigate}
                className="font-medium text-foreground hover:underline line-clamp-1 text-sm"
              >
                {line.productName}
              </Link>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleRemove}
                aria-label="Xóa sản phẩm"
                className="text-muted-foreground hover:text-destructive shrink-0 -mr-1 -mt-1"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Phân loại: <span className="text-foreground">{line.variantName}</span>
            </div>
            <div className="mt-1">
              <Price
                amount={line.price}
                original={line.compareAtPrice ?? undefined}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-dashed">
            <QuantityInput
              value={quantity}
              onChange={(newQty) => cart.setQuantity(line.variantId, newQty)}
              min={1}
              max={line.stock}
            />
            <span className="font-semibold text-sm tabular-nums text-foreground">
              {formatVnd(lineSubtotal)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={line.productName}
          onError={(e) => {
            e.currentTarget.src = placeholderUrl;
          }}
          className="size-16 rounded-md border object-cover bg-muted shrink-0"
        />
        <div className="min-w-0">
          <Link
            href={`/products/${line.shopSlug}/${line.productSlug}`}
            onClick={onNavigate}
            className="font-medium text-foreground hover:underline line-clamp-1 text-sm"
          >
            {line.productName}
          </Link>
          <div className="text-xs text-muted-foreground mt-0.5">
            Phân loại: <span className="text-foreground">{line.variantName}</span>
          </div>
          <div className="mt-1">
            <Price
              amount={line.price}
              original={line.compareAtPrice ?? undefined}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <QuantityInput
          value={quantity}
          onChange={(newQty) => cart.setQuantity(line.variantId, newQty)}
          min={1}
          max={line.stock}
        />
        <div className="w-24 text-right font-semibold text-sm tabular-nums">
          {formatVnd(lineSubtotal)}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRemove}
          aria-label="Xóa sản phẩm"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
